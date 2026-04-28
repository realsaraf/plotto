import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:share_plus/share_plus.dart';

import 'package:toatre/models/toat_summary.dart';
import 'package:toatre/utils/app_colors.dart';
import 'package:toatre/utils/text_styles.dart';

class ShareToatScreen extends StatefulWidget {
  const ShareToatScreen({super.key, required this.toat});

  final ToatSummary toat;

  @override
  State<ShareToatScreen> createState() => _ShareToatScreenState();
}

class _ShareToatScreenState extends State<ShareToatScreen> {
  final Set<String> _selectedPeople = <String>{};
  _SharePermission _permission = _SharePermission.view;

  @override
  void initState() {
    super.initState();
    final people = _people;
    for (final person in people.take(2)) {
      _selectedPeople.add(person.name);
    }
  }

  List<_SharePerson> get _people {
    final fromToat = widget.toat.people
        .where((person) => person.trim().isNotEmpty)
        .map((person) => _SharePerson(name: _cleanPersonName(person)))
        .toList();

    if (fromToat.isNotEmpty) {
      return fromToat;
    }

    return const <_SharePerson>[
      _SharePerson(name: 'Priya'),
      _SharePerson(name: 'Aman'),
      _SharePerson(name: 'Riya'),
    ];
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: SafeArea(
        child: Stack(
          children: [
            Positioned.fill(
              top: 38,
              child: Container(
                decoration: const BoxDecoration(
                  color: Color(0xFFFDFDFF),
                  borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
                ),
                child: ListView(
                  padding: const EdgeInsets.fromLTRB(20, 22, 20, 28),
                  children: [
                    Center(
                      child: Container(
                        width: 54,
                        height: 5,
                        decoration: BoxDecoration(
                          color: const Color(0xFFB8B8C8),
                          borderRadius: BorderRadius.circular(99),
                        ),
                      ),
                    ),
                    const SizedBox(height: 28),
                    Center(
                      child: Text(
                        'Share toat',
                        style: TextStyles.heading1.copyWith(fontSize: 28),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Center(
                      child: Text(
                        'Choose who can see this toat.',
                        style: TextStyles.body.copyWith(
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ),
                    const SizedBox(height: 28),
                    _ToatPreviewCard(toat: widget.toat),
                    const SizedBox(height: 30),
                    Text('Share with', style: TextStyles.heading3),
                    const SizedBox(height: 18),
                    _PeopleChooser(
                      people: _people,
                      selectedPeople: _selectedPeople,
                      onToggle: _togglePerson,
                    ),
                    const SizedBox(height: 28),
                    const Divider(color: Color(0xFFE6E6F0)),
                    const SizedBox(height: 24),
                    Text('Or share via link', style: TextStyles.heading3),
                    const SizedBox(height: 18),
                    _ShareLinkCard(onTap: _shareViaLink),
                    const SizedBox(height: 28),
                    const Divider(color: Color(0xFFE6E6F0)),
                    const SizedBox(height: 24),
                    Text('Permission', style: TextStyles.heading3),
                    const SizedBox(height: 16),
                    _PermissionSwitch(
                      permission: _permission,
                      onChanged: (permission) {
                        setState(() {
                          _permission = permission;
                        });
                      },
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        const Icon(
                          Icons.lock_outline_rounded,
                          size: 18,
                          color: AppColors.textMuted,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'View only is recommended',
                          style: TextStyles.body.copyWith(
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 36),
                    SizedBox(
                      height: 58,
                      child: ElevatedButton.icon(
                        onPressed: _sendShare,
                        icon: const Icon(Icons.send_rounded),
                        label: const Text('Send'),
                        style: ElevatedButton.styleFrom(
                          textStyle: TextStyles.heading3.copyWith(
                            fontWeight: FontWeight.w800,
                          ),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(18),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            Positioned(
              top: 72,
              left: 18,
              child: _CloseButton(onTap: () => Navigator.of(context).pop()),
            ),
          ],
        ),
      ),
    );
  }

  void _togglePerson(String name) {
    setState(() {
      if (_selectedPeople.contains(name)) {
        _selectedPeople.remove(name);
      } else {
        _selectedPeople.add(name);
      }
    });
  }

  Future<void> _shareViaLink() async {
    await Share.share(_shareText(), subject: widget.toat.title);
  }

  Future<void> _sendShare() async {
    if (_selectedPeople.isEmpty) {
      await _shareViaLink();
      return;
    }

    final names = _selectedPeople.join(', ');
    if (!mounted) return;
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text('Share invite ready for $names.')));
  }

  String _shareText() {
    final buffer = StringBuffer()..writeln(widget.toat.title);
    if (widget.toat.datetime != null) {
      buffer.writeln(_formatDateLine(widget.toat));
    }
    if (widget.toat.location != null && widget.toat.location!.isNotEmpty) {
      buffer.writeln(widget.toat.location);
    }
    if (widget.toat.notes != null && widget.toat.notes!.isNotEmpty) {
      buffer.writeln(widget.toat.notes);
    }
    return buffer.toString().trim();
  }
}

class _CloseButton extends StatelessWidget {
  const _CloseButton({required this.onTap});

  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 54,
        height: 54,
        decoration: BoxDecoration(
          color: Colors.white,
          shape: BoxShape.circle,
          boxShadow: const [
            BoxShadow(
              color: Color(0x160F172A),
              blurRadius: 20,
              offset: Offset(0, 8),
            ),
          ],
        ),
        child: const Icon(Icons.close_rounded, size: 30),
      ),
    );
  }
}

class _ToatPreviewCard extends StatelessWidget {
  const _ToatPreviewCard({required this.toat});

  final ToatSummary toat;

  @override
  Widget build(BuildContext context) {
    final colors = _kindColors(toat.kind);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: const Color(0xFFE7E7F0)),
        boxShadow: const [
          BoxShadow(
            color: Color(0x120F172A),
            blurRadius: 28,
            offset: Offset(0, 12),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 74,
            height: 74,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(18),
              gradient: LinearGradient(colors: colors),
            ),
            child: Icon(_kindIcon(toat), color: Colors.white, size: 38),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  toat.title,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyles.heading3.copyWith(fontSize: 20),
                ),
                const SizedBox(height: 10),
                if (toat.datetime != null)
                  _PreviewMetaRow(
                    icon: Icons.calendar_today_outlined,
                    text: _formatDateLine(toat),
                    highlight: DateFormat.jm().format(toat.datetime!),
                  ),
                if (toat.location != null && toat.location!.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  _PreviewMetaRow(
                    icon: Icons.location_on_outlined,
                    text: toat.location!,
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(width: 8),
          const Icon(
            Icons.chevron_right_rounded,
            color: AppColors.textMuted,
            size: 34,
          ),
        ],
      ),
    );
  }
}

class _PreviewMetaRow extends StatelessWidget {
  const _PreviewMetaRow({
    required this.icon,
    required this.text,
    this.highlight,
  });

  final IconData icon;
  final String text;
  final String? highlight;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 18, color: AppColors.textMuted),
        const SizedBox(width: 10),
        Expanded(
          child: Text.rich(
            TextSpan(children: _spans),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyles.body.copyWith(color: AppColors.textSecondary),
          ),
        ),
      ],
    );
  }

  List<TextSpan> get _spans {
    final value = highlight;
    if (value == null || value.isEmpty || !text.contains(value)) {
      return <TextSpan>[TextSpan(text: text)];
    }
    final parts = text.split(value);
    return <TextSpan>[
      TextSpan(text: parts.first),
      TextSpan(
        text: value,
        style: const TextStyle(color: AppColors.primary),
      ),
      TextSpan(text: parts.skip(1).join(value)),
    ];
  }
}

class _PeopleChooser extends StatelessWidget {
  const _PeopleChooser({
    required this.people,
    required this.selectedPeople,
    required this.onToggle,
  });

  final List<_SharePerson> people;
  final Set<String> selectedPeople;
  final ValueChanged<String> onToggle;

  @override
  Widget build(BuildContext context) {
    final visible = people.take(3).toList();

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        for (final person in visible)
          _PersonBubble(
            person: person,
            selected: selectedPeople.contains(person.name),
            onTap: () => onToggle(person.name),
          ),
        const _MoreBubble(),
      ],
    );
  }
}

class _PersonBubble extends StatelessWidget {
  const _PersonBubble({
    required this.person,
    required this.selected,
    required this.onTap,
  });

  final _SharePerson person;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: SizedBox(
        width: 72,
        child: Column(
          children: [
            Stack(
              clipBehavior: Clip.none,
              children: [
                Container(
                  width: 64,
                  height: 64,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: selected
                          ? AppColors.primary
                          : const Color(0xFFE8E7F2),
                      width: selected ? 2 : 1,
                    ),
                    gradient: LinearGradient(
                      colors: _avatarColors(person.name),
                    ),
                  ),
                  child: Center(
                    child: Text(
                      _initials(person.name),
                      style: TextStyles.heading3.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                ),
                if (selected)
                  Positioned(
                    right: -3,
                    bottom: -2,
                    child: Container(
                      width: 30,
                      height: 30,
                      decoration: const BoxDecoration(
                        color: AppColors.primary,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.check_rounded,
                        color: Colors.white,
                        size: 22,
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 10),
            Text(
              person.name,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyles.bodyMedium,
            ),
          ],
        ),
      ),
    );
  }
}

class _MoreBubble extends StatelessWidget {
  const _MoreBubble();

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 72,
      child: Column(
        children: [
          Container(
            width: 64,
            height: 64,
            decoration: const BoxDecoration(
              color: Color(0xFFF4F0FF),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.groups_2_outlined,
              color: AppColors.primary,
              size: 32,
            ),
          ),
          const SizedBox(height: 10),
          Text('More', style: TextStyles.bodyMedium),
        ],
      ),
    );
  }
}

class _ShareLinkCard extends StatelessWidget {
  const _ShareLinkCard({required this.onTap});

  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: const Color(0xFFE7E7F0)),
          boxShadow: const [
            BoxShadow(
              color: Color(0x100F172A),
              blurRadius: 24,
              offset: Offset(0, 10),
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              width: 58,
              height: 58,
              decoration: const BoxDecoration(
                color: Color(0xFFF4F0FF),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.link_rounded,
                color: AppColors.primary,
                size: 32,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Share link', style: TextStyles.heading3),
                  const SizedBox(height: 6),
                  Text(
                    'Anyone with the link can view',
                    style: TextStyles.body.copyWith(
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
            const Icon(
              Icons.chevron_right_rounded,
              color: AppColors.textMuted,
              size: 34,
            ),
          ],
        ),
      ),
    );
  }
}

class _PermissionSwitch extends StatelessWidget {
  const _PermissionSwitch({required this.permission, required this.onChanged});

  final _SharePermission permission;
  final ValueChanged<_SharePermission> onChanged;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE7E7F0)),
        boxShadow: const [
          BoxShadow(
            color: Color(0x0D0F172A),
            blurRadius: 18,
            offset: Offset(0, 8),
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: _PermissionOption(
              selected: permission == _SharePermission.view,
              icon: Icons.visibility_outlined,
              title: 'View only',
              subtitle: 'Can\'t make changes',
              onTap: () => onChanged(_SharePermission.view),
            ),
          ),
          Expanded(
            child: _PermissionOption(
              selected: permission == _SharePermission.edit,
              icon: Icons.edit_outlined,
              title: 'Can edit',
              subtitle: 'Can make changes',
              onTap: () => onChanged(_SharePermission.edit),
            ),
          ),
        ],
      ),
    );
  }
}

class _PermissionOption extends StatelessWidget {
  const _PermissionOption({
    required this.selected,
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  final bool selected;
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
        decoration: BoxDecoration(
          color: selected ? const Color(0xFFF3EEFF) : Colors.transparent,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Row(
          children: [
            Icon(
              icon,
              color: selected ? AppColors.primary : AppColors.textMuted,
              size: 26,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyles.bodyMedium.copyWith(
                      color: selected ? AppColors.primary : AppColors.text,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    subtitle,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyles.small.copyWith(
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SharePerson {
  const _SharePerson({required this.name});

  final String name;
}

enum _SharePermission { view, edit }

String _cleanPersonName(String value) {
  final trimmed = value.trim();
  if (trimmed.startsWith('@')) {
    return trimmed.substring(1);
  }
  return trimmed;
}

String _initials(String name) {
  final parts = name
      .trim()
      .split(RegExp(r'\s+'))
      .where((part) => part.isNotEmpty)
      .toList();
  if (parts.isEmpty) return '?';
  if (parts.length == 1) return parts.first.characters.first.toUpperCase();
  return '${parts.first.characters.first}${parts.last.characters.first}'
      .toUpperCase();
}

List<Color> _avatarColors(String name) {
  final palettes = <List<Color>>[
    const [Color(0xFFEC4899), Color(0xFFF59E0B)],
    const [Color(0xFF2563EB), Color(0xFF7C3AED)],
    const [Color(0xFF14B8A6), Color(0xFF6366F1)],
    const [Color(0xFFEF4444), Color(0xFFF97316)],
  ];
  return palettes[name.hashCode.abs() % palettes.length];
}

List<Color> _kindColors(String kind) {
  switch (kind) {
    case 'meeting':
      return const [Color(0xFF3B82F6), Color(0xFF2563EB)];
    case 'event':
      return const [Color(0xFF7C3AED), Color(0xFFA855F7)];
    case 'errand':
      return const [Color(0xFFEC4899), Color(0xFFD946EF)];
    case 'deadline':
      return const [Color(0xFFEF4444), Color(0xFFF97316)];
    case 'idea':
      return const [Color(0xFFF59E0B), Color(0xFFFBBF24)];
    case 'task':
    default:
      return const [Color(0xFF7C3AED), Color(0xFF4F46E5)];
  }
}

IconData _kindIcon(ToatSummary toat) {
  final text = '${toat.title} ${toat.location ?? ''} ${toat.notes ?? ''}'
      .toLowerCase();
  if (text.contains('dentist') || text.contains('dental')) {
    return Icons.medical_services_rounded;
  }
  switch (toat.kind) {
    case 'meeting':
      return Icons.videocam_rounded;
    case 'event':
      return Icons.calendar_month_rounded;
    case 'errand':
      return Icons.shopping_bag_rounded;
    case 'deadline':
      return Icons.flag_rounded;
    case 'idea':
      return Icons.lightbulb_rounded;
    case 'task':
    default:
      return Icons.check_rounded;
  }
}

String _formatDateLine(ToatSummary toat) {
  final datetime = toat.datetime;
  if (datetime == null) return 'Any time';

  final now = DateTime.now();
  final today = DateTime(now.year, now.month, now.day);
  final day = DateTime(datetime.year, datetime.month, datetime.day);
  final tomorrow = today.add(const Duration(days: 1));

  final label = day == today
      ? 'Today'
      : day == tomorrow
      ? 'Tomorrow'
      : DateFormat.MMMd().format(datetime);

  return '$label · ${DateFormat.jm().format(datetime)}';
}
