import 'package:flutter/material.dart';

/// Single source of truth for all brand colours.
///
/// Brand gradient: Indigo #4F46E5 → Amber #F59E0B
/// NEVER hardcode these hex values anywhere else in the codebase.
class AppColors {
  AppColors._();

  // ── Brand gradient ──────────────────────────────────────────────────────
  static const Color gradientStart = Color(0xFF4F46E5); // Indigo
  static const Color gradientEnd = Color(0xFFF59E0B); // Amber

  static const LinearGradient brandGradient = LinearGradient(
    begin: Alignment.centerLeft,
    end: Alignment.centerRight,
    colors: [gradientStart, gradientEnd],
  );

  // ── Primary (Indigo) ────────────────────────────────────────────────────
  static const Color primary = gradientStart;
  static const Color primaryLight = Color(0xFF818CF8);
  static const Color primaryDark = Color(0xFF3730A3);

  // ── Accent (Amber) ──────────────────────────────────────────────────────
  static const Color accent = gradientEnd;
  static const Color accentLight = Color(0xFFFBBF24);

  // ── Backgrounds ─────────────────────────────────────────────────────────
  static const Color bg = Color(0xFFFBFAFF);
  static const Color bgPrimary = bg;
  static const Color bgElevated = Color(0xF2FFFFFF);
  static const Color bgSecondary = bgElevated;
  static const Color card = Color(0xEFFFFFFF);
  static const Color glass = Color(0xD9FFFFFF);

  // ── Text ────────────────────────────────────────────────────────────────
  static const Color text = Color(0xFF111827);
  static const Color textPrimary = text;
  static const Color textSecondary = Color(0xFF4B5563);
  static const Color textMuted = Color(0xFF6B7280);

  // ── Border ──────────────────────────────────────────────────────────────
  static const Color border = Color(0xE6FFFFFF);
  static const Color softBorder = Color(0xFFE5E7EB);
  static const Color softPurple = Color(0xFFEDE9FE);

  // ── Status ──────────────────────────────────────────────────────────────
  static const Color success = Color(0xFF22C55E);
  static const Color error = Color(0xFFEF4444);
  static const Color warning = Color(0xFFF59E0B);
  static const Color info = Color(0xFF3B82F6);

  // ── Tier colours ────────────────────────────────────────────────────────
  static const Color tierUrgent = Color(0xFFEF4444);
  static const Color tierImportant = Color(0xFFF59E0B);
  static const Color tierRegular = Color(0xFF6B7A94);

  // ── Mic button ──────────────────────────────────────────────────────────
  static const Color micIdle = gradientStart;
  static const Color micRecording = Color(0xFFEF4444);
}
