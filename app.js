cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
const element = document.getElementById('dicomImage');
cornerstone.enable(element);

let dicomFiles = [];
let currentIndex = 0;

document.getElementById('zipFile').addEventListener('change', function (e) {
  const file = e.target.files[0];
  const zip = new JSZip();

  zip.loadAsync(file).then(async function (zip) {
    const entries = Object.values(zip.files).filter(f => f.name.endsWith('.dcm'));
    dicomFiles = [];

    for (const entry of entries) {
      const arrayBuffer = await entry.async('arraybuffer');
      const blob = new Blob([arrayBuffer], { type: 'application/dicom' });
      dicomFiles.push(blob);
    }

    currentIndex = 0;
    loadAndDisplayImage(dicomFiles[currentIndex]);
  });
});

document.getElementById('prevBtn').addEventListener('click', () => {
  if (currentIndex > 0) {
    currentIndex--;
    loadAndDisplayImage(dicomFiles[currentIndex]);
  }
});

document.getElementById('nextBtn').addEventListener('click', () => {
  if (currentIndex < dicomFiles.length - 1) {
    currentIndex++;
    loadAndDisplayImage(dicomFiles[currentIndex]);
  }
});

function loadAndDisplayImage(blob) {
  const imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(blob);
  cornerstone.loadAndCacheImage(imageId).then(image => {
    cornerstone.displayImage(element, image);

    const dataset = cornerstoneWADOImageLoader.wadouri.dataSetCacheManager.get(imageId);
    const patientName = dataset.string('x00100010') || 'N/A';
    const studyDate = dataset.string('x00080020') || 'N/A';
    const modality = dataset.string('x00080060') || 'N/A';

    document.getElementById('metadata').textContent = `
      Ảnh ${currentIndex + 1} / ${dicomFiles.length}
      Tên bệnh nhân: ${patientName}
      Ngày chụp: ${studyDate}
      Modality: ${modality}
    `;
  });
}