import 'package:flutter/material.dart';
import 'package:toatre/utils/app_colors.dart';
import 'package:toatre/utils/text_styles.dart';

class ToatreMark extends StatelessWidget {
  final double fontSize;

  const ToatreMark({super.key, this.fontSize = 28});

  @override
  Widget build(BuildContext context) {
    return ShaderMask(
      shaderCallback: (bounds) => AppColors.brandGradient.createShader(bounds),
      blendMode: BlendMode.srcIn,
      child: Text(
        'toatre',
        style: TextStyles.heading1.copyWith(
          fontSize: fontSize,
          fontWeight: FontWeight.w600,
          letterSpacing: 0,
          color: Colors.white,
        ),
      ),
    );
  }
}
