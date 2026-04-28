import 'package:flutter/material.dart';
import 'package:google_sign_in/google_sign_in.dart';

import 'package:toatre/models/user_settings.dart';
import 'package:toatre/services/api_service.dart';

class SettingsProvider extends ChangeNotifier {
  final ApiService _api = ApiService.instance;
  final GoogleSignIn _googleCalendarSignIn = GoogleSignIn(
    scopes: <String>[
      'email',
      'profile',
      'https://www.googleapis.com/auth/calendar.events',
    ],
  );

  bool _loading = false;
  String? _error;
  String? _savingKey;
  SettingsPayload? _payload;

  bool get loading => _loading;
  String? get error => _error;
  String? get savingKey => _savingKey;
  SettingsPayload? get payload => _payload;
  bool get hasLoaded => _payload != null;

  Future<void> loadSettings() async {
    _loading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _api.getJson('/api/settings', authenticated: true);
      _payload = SettingsPayload.fromJson(response);
    } on ApiServiceException catch (error) {
      _error = error.message;
    } catch (_) {
      _error = 'Could not load your settings.';
    }

    _loading = false;
    notifyListeners();
  }

  Future<SettingsPayload> saveGeneral({
    required String timezone,
    required String workStart,
    required String workEnd,
    required bool voiceRetention,
  }) async {
    return _runSave(
      'general',
      () async => SettingsPayload.fromJson(
        await _api.patchJson(
          '/api/settings',
          body: <String, Object?>{
            'timezone': timezone,
            'workStart': workStart,
            'workEnd': workEnd,
            'voiceRetention': voiceRetention,
          },
          authenticated: true,
        ),
      ),
    );
  }

  Future<SettingsPayload> saveHandle(String handle) async {
    return _runSave('handle', () async {
      final normalized = handle.trim().replaceFirst(RegExp(r'^@+'), '');
      await _api.postJson(
        '/api/auth/profile',
        body: <String, Object?>{'handle': normalized},
        authenticated: true,
      );
      final response = await _api.getJson('/api/settings', authenticated: true);
      return SettingsPayload.fromJson(response);
    });
  }

  Future<SettingsPayload> sendPhoneCode(String phone) async {
    return _runSave('phone-start', () async {
      await _api.postJson(
        '/api/twilio/verify/start',
        body: <String, Object?>{'phone': phone},
        authenticated: true,
      );
      final response = await _api.getJson('/api/settings', authenticated: true);
      return SettingsPayload.fromJson(response);
    });
  }

  Future<SettingsPayload> verifyPhoneCode({
    required String phone,
    required String code,
  }) async {
    return _runSave('phone-check', () async {
      await _api.postJson(
        '/api/twilio/verify/check',
        body: <String, Object?>{'phone': phone, 'code': code},
        authenticated: true,
      );
      final response = await _api.getJson('/api/settings', authenticated: true);
      return SettingsPayload.fromJson(response);
    });
  }

  Future<SettingsPayload> savePhoneSettings({required bool smsEnabled}) async {
    return _runSave(
      'phone-save',
      () async => SettingsPayload.fromJson(
        await _api.patchJson(
          '/api/settings',
          body: <String, Object?>{'smsEnabled': smsEnabled},
          authenticated: true,
        ),
      ),
    );
  }

  Future<SettingsPayload> savePingSettings(
    NotificationPreferences preferences,
  ) async {
    return _runSave(
      'pings',
      () async => SettingsPayload.fromJson(
        await _api.patchJson(
          '/api/settings',
          body: <String, Object?>{
            'notificationPreferences': notificationPreferencesToJson(
              preferences,
            ),
          },
          authenticated: true,
        ),
      ),
    );
  }

  Future<SettingsPayload> connectGoogleCalendar({
    required SyncDirection direction,
  }) async {
    return _runSave('sync-google', () async {
      final googleUser =
          await _googleCalendarSignIn.signInSilently() ??
          await _googleCalendarSignIn.signIn();

      if (googleUser == null) {
        throw const ApiServiceException(
          statusCode: 401,
          message: 'Google Calendar connection was cancelled.',
        );
      }

      final granted = await _googleCalendarSignIn.requestScopes(<String>[
        'https://www.googleapis.com/auth/calendar.events',
      ]);

      if (!granted) {
        throw const ApiServiceException(
          statusCode: 403,
          message: 'Google Calendar permission was not granted.',
        );
      }

      return _saveSyncConnection(
        provider: googleCalendarProviderKey,
        direction: direction,
        connected: true,
      );
    });
  }

  Future<SettingsPayload> disconnectGoogleCalendar({
    required SyncDirection direction,
  }) async {
    return _runSave(
      'sync-google',
      () async => _saveSyncConnection(
        provider: googleCalendarProviderKey,
        direction: direction,
        connected: false,
      ),
    );
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }

  Future<SettingsPayload> _runSave(
    String key,
    Future<SettingsPayload> Function() action,
  ) async {
    _savingKey = key;
    _error = null;
    notifyListeners();

    try {
      final next = await action();
      _payload = next;
      return next;
    } on ApiServiceException catch (error) {
      _error = error.message;
      rethrow;
    } catch (_) {
      _error = 'Could not save your settings.';
      rethrow;
    } finally {
      _savingKey = null;
      notifyListeners();
    }
  }

  Future<SettingsPayload> _saveSyncConnection({
    required String provider,
    required SyncDirection direction,
    required bool connected,
  }) async {
    final existingConnections =
        _payload?.settings.syncConnections ?? <String, SyncConnection>{};
    final now = DateTime.now().toUtc();
    final existing = existingConnections[provider];
    final nextConnection = SyncConnection(
      provider: provider,
      direction: direction,
      connected: connected,
      connectedAt: connected ? existing?.connectedAt ?? now : null,
      forwardOnlyFrom: connected ? existing?.forwardOnlyFrom ?? now : null,
      updatedAt: now,
    );
    final nextConnections = <String, SyncConnection>{
      ...existingConnections,
      provider: nextConnection,
    };

    return SettingsPayload.fromJson(
      await _api.patchJson(
        '/api/settings',
        body: <String, Object?>{
          'syncConnections': syncConnectionsToJson(nextConnections),
        },
        authenticated: true,
      ),
    );
  }
}
