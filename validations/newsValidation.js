import vine from "@vinejs/vine";
import { CustomErrorReporter } from "./CustomError.js";

vine.customErrorReporter = () => new CustomErrorReporter();

export const newsSchema = vine.object({
  title: vine.string().minLength(3).maxLength(190),
  content: vine.string().minLength(10).maxLength(10000),
});
