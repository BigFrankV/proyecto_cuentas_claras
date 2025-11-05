const React = require('react');

// Simple mocks for commonly used MUI icons to avoid importing MUI internals in Jest
module.exports = {
  __esModule: true,
  PhotoCamera: () => React.createElement('span', null, 'photo-camera'),
  Edit: () => React.createElement('span', null, 'edit'),
  Photo: () => React.createElement('span', null, 'photo'),
  Save: () => React.createElement('span', null, 'save'),
  Clear: () => React.createElement('span', null, 'clear'),
  Assessment: () => React.createElement('span', null, 'assessment'),
  FileDownload: () => React.createElement('span', null, 'file-download'),
  PlaylistAddCheck: () =>
    React.createElement('span', null, 'playlist-add-check'),
  ArrowBack: () => React.createElement('span', null, 'arrow-back'),
};

// Also provide a default export object so imports like `import Icons from '@mui/icons-material'` work
module.exports.default = module.exports;
