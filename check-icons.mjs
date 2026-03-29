import * as Hugeicons from '@hugeicons/core-free-icons';

const targetIcons = [
  'FileText01Icon', 'File01Icon', 'SquareLock02Icon', 'DocumentTextIcon', 'Invoice01Icon',
  'FolderOpen01Icon', 'Folder01Icon',
  'LibraryIcon', 'BookOpen01Icon', 'Book01Icon',
  'Home01Icon',
  'DashboardSquare01Icon', 'Layout01Icon',
  'Settings01Icon',
  'MonitorPlay01Icon', 'Presentation01Icon', 'AirplayLineIcon', 'Tv01Icon',
  'CreditCard01Icon',
  'Logout01Icon',
  'SparklesIcon', 'MagicWand01Icon', 'StarsIcon',
  'CrownIcon', 'CheckmarkBadge01Icon', 'Tick02Icon',
  'UserIcon', 'Bell01Icon', 'Shield01Icon', 'Key01Icon', 'Moon01Icon', 'Sun01Icon',
  'Search01Icon', 'PencilEdit01Icon', 'PlusSignIcon', 'FilterIcon', 'ListArrowDown01Icon', 'GridIcon', 'Delete01Icon', 'MoreVerticalIcon', 'PlayIcon'
];

targetIcons.forEach(icon => {
  if (Hugeicons[icon]) {
    console.log('[FOUND] ' + icon);
  }
});
