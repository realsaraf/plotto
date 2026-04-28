class ToatreConnection {
  const ToatreConnection({
    required this.id,
    required this.name,
    required this.relationship,
    required this.createdAt,
    required this.updatedAt,
    this.phone,
    this.email,
    this.handle,
    this.notes,
  });

  final String id;
  final String name;
  final String relationship;
  final String? phone;
  final String? email;
  final String? handle;
  final String? notes;
  final DateTime createdAt;
  final DateTime updatedAt;

  factory ToatreConnection.fromJson(Map<String, dynamic> json) {
    return ToatreConnection(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? 'Connection',
      relationship: json['relationship'] as String? ?? 'connection',
      phone: _nullableString(json['phone']),
      email: _nullableString(json['email']),
      handle: _nullableString(json['handle']),
      notes: _nullableString(json['notes']),
      createdAt: _parseDate(json['createdAt']),
      updatedAt: _parseDate(json['updatedAt']),
    );
  }

  Map<String, Object?> toJson() => <String, Object?>{
    'name': name,
    'relationship': relationship,
    'phone': phone,
    'email': email,
    'handle': handle,
    'notes': notes,
  };
}

class ShareToatResult {
  const ShareToatResult({required this.shareUrl});

  final String shareUrl;

  factory ShareToatResult.fromJson(Map<String, dynamic> json) {
    return ShareToatResult(shareUrl: json['shareUrl'] as String? ?? '');
  }
}

String? _nullableString(Object? value) {
  if (value is! String || value.trim().isEmpty) {
    return null;
  }
  return value.trim();
}

DateTime _parseDate(Object? value) {
  if (value is String) {
    return DateTime.tryParse(value) ?? DateTime.now();
  }
  return DateTime.now();
}
