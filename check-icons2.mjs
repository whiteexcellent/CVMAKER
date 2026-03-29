import * as Hugeicons from '@hugeicons/core-free-icons';

const targetIcons = [
  'CreditCardIcon', 'Wallet01Icon', 'BankIcon',
  'Notification01Icon', 'Bell02Icon', 'Alert01Icon',
  'FolderOpenIcon', 'OpenFolderIcon',
  'Monitor01Icon', 'ComputerIcon', 'Video01Icon', 'PlayCircleIcon', 'VideoPlayIcon',
  'ListSettingIcon', 'ListViewIcon', 'Task01Icon', 'Menu01Icon', 'Menu11Icon', 'BulletListIcon'
];

targetIcons.forEach(icon => {
  if (Hugeicons[icon]) {
    console.log('[FOUND] ' + icon);
  }
});
