const uploadBox = document.querySelector(".upload-box"),
  previewImg = uploadBox.querySelector("img"),
  fileInput = uploadBox.querySelector("input"),
  widthInput = document.querySelector(".width input"),
  heightInput = document.querySelector(".height input"),
  ratioInput = document.querySelector(".ratio input"),
  qualityInput = document.querySelector(".quality input"),
  formatSelect = document.querySelector("#format"),
  maxSizeInput = document.querySelector("#maxSize"),
  sizeUnitSelect = document.querySelector("#sizeUnit"),
  downloadBtn = document.querySelector(".download-btn");

let ogImageRatio;

const loadFile = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  previewImg.src = URL.createObjectURL(file);
  previewImg.addEventListener("load", () => {
    widthInput.value = previewImg.naturalWidth;
    heightInput.value = previewImg.naturalHeight;
    ogImageRatio = previewImg.naturalWidth / previewImg.naturalHeight;
    document.querySelector(".wrapper").classList.add("active");
  });
};

widthInput.addEventListener("keyup", () => {
  const height = ratioInput.checked ? widthInput.value / ogImageRatio : heightInput.value;
  heightInput.value = Math.floor(height);
});

heightInput.addEventListener("keyup", () => {
  const width = ratioInput.checked ? heightInput.value * ogImageRatio : widthInput.value;
  widthInput.value = Math.floor(width);
});

const resizeAndCompress = async (canvas, desiredSize) => {
  let quality = 1.0;
  let output;

  do {
    output = canvas.toDataURL("image/jpeg", quality);
    const sizeInMB = (output.length * (3 / 4)) / 1024 / 1024; // Convert Base64 size to MB
    const sizeInKB = sizeInMB * 1024; // Convert to KB
    const sizeInDesiredUnit = sizeUnitSelect.value === "MB" ? sizeInMB : sizeInKB;

    if (sizeInDesiredUnit <= desiredSize) break;
    quality -= 0.1; // Gradually reduce quality
  } while (quality > 0);

  return output;
};

const resizeAndDownload = async () => {
  const canvas = document.createElement("canvas");
  const a = document.createElement("a");
  const ctx = canvas.getContext("2d");

  const imgQuality = qualityInput.checked ? 0.5 : 1.0;
  const selectedFormat = formatSelect.value;
  const maxFileSize = parseFloat(maxSizeInput.value);

  canvas.width = widthInput.value;
  canvas.height = heightInput.value;
  ctx.drawImage(previewImg, 0, 0, canvas.width, canvas.height);

  if (selectedFormat === "pdf") {
    const pdf = new jsPDF();
    const imgData = canvas.toDataURL("image/jpeg", imgQuality);
    pdf.addImage(imgData, "JPEG", 10, 10, canvas.width / 10, canvas.height / 10);
    pdf.save(`${new Date().getTime()}.pdf`);
  } else {
    let imageData;
    if (maxFileSize) {
      imageData = await resizeAndCompress(canvas, maxFileSize);
    } else {
      imageData = canvas.toDataURL(`image/${selectedFormat}`, imgQuality);
    }

    a.href = imageData;
    a.download = `${new Date().getTime()}.${selectedFormat}`;
    a.click();
  }
};

downloadBtn.addEventListener("click", resizeAndDownload);
fileInput.addEventListener("change", loadFile);
uploadBox.addEventListener("click", () => fileInput.click());
