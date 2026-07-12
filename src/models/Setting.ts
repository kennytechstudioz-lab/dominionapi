import { Schema, model } from "mongoose";

const SettingSchema = new Schema(
  {
    companyName: {
      type: String,
      default: "Dominion Group",
      trim: true,
    },
    domainName: {
      type: String,
      default: "dominiongroup.online",
      trim: true,
    },
    email: {
      type: String,
      default: "support@dominiongroup.online",
      trim: true,
    },
    phone: {
      type: String,
      default: "+1234567890",
      trim: true,
    },
    address: {
      type: String,
      default: "123 Solar Street, Green City",
      trim: true,
    },
    description: {
      type: String,
      default: "Dominion Group is a global leader in clean-energy investments, delivering sustainable and secured high-yield dividends.",
      trim: true,
    },
    showCurrency: {
      type: Boolean,
      default: false,
    },
    registrationLink: {
      type: String,
      default: "",
      trim: true,
    },
    mapEmbed: {
      type: String,
      default: "",
    },
    documents: {
      type: [
        {
          name: { type: String, default: "" },
          url: { type: String, default: "" },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const Setting = model("Setting", SettingSchema);
export default Setting;
