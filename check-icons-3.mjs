import * as Hugeicons from '@hugeicons/core-free-icons';

const targetIcons = [
  'Loading03Icon', 'Loading01Icon', 'PrinterIcon', 'SentIcon', 'TelegramIcon', 'PaperPlaneIcon',
  'ArrowLeft01Icon', 'ArrowRight01Icon', 'ChevronLeftIcon', 'ChevronRightIcon',
  'Download01Icon', 'CloudDownloadIcon', 'SaveIcon', 'Save01Icon', 'Share01Icon', 'Share04Icon',
  'Building01Icon', 'City01Icon', 'Message01Icon', 'Comment01Icon', 'ChatQuestionIcon',
  'Briefcase01Icon', 'AddCircleIcon', 'Add01Icon', 'DocumentAddIcon', 'Globe01Icon', 'EarthIcon',
  'Alert01Icon', 'FlashIcon', 'ZapIcon', 'Cancel01Icon', 'MultiplicationSignIcon'
];

targetIcons.forEach(icon => {
  if (Hugeicons[icon]) {
    console.log('[FOUND] ' + icon);
  }
});
