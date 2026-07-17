"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Setting = void 0;
const mongoose_1 = require("mongoose");
const SettingSchema = new mongoose_1.Schema({
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
    certificateUrl: {
        type: String,
        default: "",
        trim: true,
    },
    documents: {
        type: [
            {
                name: { type: String, default: "" },
                url: { type: String, default: "" },
                language: { type: String, default: "" },
            },
        ],
        default: [],
    },
}, {
    timestamps: true,
});
exports.Setting = (0, mongoose_1.model)("Setting", SettingSchema);
exports.default = exports.Setting;
