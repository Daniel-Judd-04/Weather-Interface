const VARS = ['--PriBG', '--SecBG', '--ConBG', '--NorTxt', '--SubTxt', '--BolTxt', '--PopBG', '--High', '--Low', '--Rain', '--HighlightCol'];

const COLORS = [
//  PriBG,      SecBG,     ConBG,    NorTxt,     SubTxt,    BolTxt,    PopBG,       High,      Low,       Rain,      HighlightCol
    ['#00487C', '#043565', '#043565', '#EFEFEF', '#CDCDCD', '#D17400', '#00000080', '#3BB273', '#E15554', '#4D9DE0', 'rgba(209, 116, 0, 0.99)'], // NORMAL
    ['#121212', '#232323', '#232323', '#BCBCBC', '#BCBCBC', '#D17400', '#12121290', '#3BB273', '#E15554', '#4D9DE0', 'rgba(209, 116, 0, 0.99)'], // DARK
    ['#EFEFEF', '#FFFFFF', '#FFFFFF', '#232323', '#454545', '#D17400', '#EFEFEF40', '#3BB273', '#E15554', '#4D9DE0', 'rgba(209, 116, 0, 0.99)'], // LIGHT
    ['#000000', '#232323', '#232323', '#E5FF00', '#E5FF00', '#E5FF00', '#111111FF', '#E5FF00', '#E5FF00', '#E5FF00', 'rgba(229, 255, 0, 0.99)'], // CONTRAST
    ['#FFD6E2', '#FFADC6', '#FFADC6', '#020D13', '#031926', '#FF6392', '#FF639240', '#3BB273', '#E15554', '#4D9DE0', 'rgba(209, 116, 0, 0.99)'], // PINK
    ['#' + (Math.floor(Math.random() * (Math.pow(16, 6)-1))).toString(16), '#' + (Math.floor(Math.random() * 16777215)).toString(16), '#' + (Math.floor(Math.random() * 16777215)).toString(16), '#' + (Math.floor(Math.random() * 16777215)).toString(16), '#' + (Math.floor(Math.random() * 16777215)).toString(16), '#' + (Math.floor(Math.random() * 16777215)).toString(16), '#' + (Math.floor(Math.random() * 16777215)).toString(16), '#' + (Math.floor(Math.random() * 16777215)).toString(16), '#' + (Math.floor(Math.random() * 16777215)).toString(16), '#' + (Math.floor(Math.random() * 16777215)).toString(16), '#' + (Math.floor(Math.random() * 16777215)).toString(16)]  // RANDOM
];

