$map = @{
  'border-ink-100' = 'border-line';
  'border-ink-200' = 'border-line-strong';
  'border-ink-300' = 'border-line-strong';
  'bg-paper-50' = 'bg-surface';
  'bg-paper-100' = 'bg-surface-sunken';
  'bg-white' = 'bg-card';
  'text-ink-900' = 'text-fg';
  'text-ink-800' = 'text-fg';
  'text-ink-700' = 'text-fg-muted';
  'text-ink-600' = 'text-fg-muted';
  'text-ink-500' = 'text-fg-muted';
  'text-ink-400' = 'text-fg-subtle';
  'text-ink-300' = 'text-fg-subtle';
  'bg-ink-100' = 'bg-surface-sunken';
  'bg-ink-200' = 'bg-line';
  'hover:bg-ink-100' = 'hover:bg-surface-sunken';
  'hover:bg-ink-200' = 'hover:bg-line';
  'hover:text-ink-900' = 'hover:text-fg';
  'hover:border-ink-200' = 'hover:border-line-strong';
  'hover:border-ink-300' = 'hover:border-line-strong';
  'bg-coral-500' = 'bg-accent';
  'hover:bg-coral-600' = 'hover:bg-accent-strong';
  'bg-coral-50' = 'bg-accent-soft';
  'text-coral-500' = 'text-accent';
  'text-coral-600' = 'text-accent';
  'focus:border-coral-500' = 'focus:border-accent';
  'focus:ring-coral-500/20' = 'focus:ring-accent/25';
  'border-coral-500' = 'border-accent';
  'text-white' = 'text-accent-fg';
  'bg-ink-900' = 'bg-fg';
  'hover:bg-ink-800' = 'hover:opacity-90';
}
$files = Microsoft.PowerShell.Management\Get-ChildItem -Path 'apps/web/app','apps/web/components' -Recurse -Include '*.tsx' | Where-Object { $_.FullName -notmatch 'theme-' }
foreach ($f in $files) {
  $c = [System.IO.File]::ReadAllText($f.FullName)
  $orig = $c
  foreach ($k in $map.Keys) { $c = $c.Replace($k, $map[$k]) }
  if ($c -ne $orig) {
    [System.IO.File]::WriteAllText($f.FullName, $c)
    Write-Host ("Updated " + $f.Name)
  }
}
