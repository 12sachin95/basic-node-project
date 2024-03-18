import { supportedMimes } from "../config/filesystem.js";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";

export const imageValidater = (size, mime) => {
  if (bytesToMb(size) > 2) {
    return "Image size must be less than 2 Mb.";
  } else if (!supportedMimes.includes(mime)) {
    return "Image must be  type of png, jpg, jpeg, svg, gif, webp";
  }
  return null;
};

export const bytesToMb = (bytes) => {
  return bytes / (1024 * 1024);
};

export const generateRandomNumber = () => {
  return uuidv4();
};

export const getImageUrl = (imgName) => {
  return `${process.env.APP_URL}/images/${imgName}`;
};

export const removeImage = (imageName) => {
  const path = process.cwd() + "/public/images/" + imageName;

  if (fs.existsSync(path)) {
    fs.unlinkSync(path);
  }
};

export const uploadImage = (image) => {
  const splitedImg = image.name.split(".");
  const ext =
    splitedImg.length > 1 ? splitedImg[splitedImg.length - 1] : splitedImg[1];
  let imgName = generateRandomNumber() + "." + ext;

  const uploadPath = process.cwd() + "/public/images/" + imgName;
  image.mv(uploadPath, (err) => {
    if (err) {
      throw err;
    }
  });
  return imgName;
};
