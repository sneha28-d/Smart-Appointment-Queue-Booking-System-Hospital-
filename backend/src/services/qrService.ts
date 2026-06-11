const QRCode = require('qrcode');

const GenerateQRCodeModel = async (text: string): Promise<string> => {
    try {
        const qrCodeDataUrl = await QRCode.toDataURL(text);
        return qrCodeDataUrl;
    } catch (err) {
        console.error('Error generating QR code', err);
        return '';
    }
};

module.exports = { GenerateQRCodeModel };
