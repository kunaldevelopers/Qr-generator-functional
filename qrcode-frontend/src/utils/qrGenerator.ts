import QRCode from "qrcode";

interface CustomizationOptions {
  color: string;
  backgroundColor: string;
  margin: number;
  logo?: string | null;
  // Advanced QR Design options
  dotStyle?: "square" | "dots" | "rounded" | "star";
  eyeStyle?: {
    frameShape: "square" | "circle" | "rounded";
    eyeBallShape: "square" | "circle" | "rounded";
    eyeFrameColor?: string;
    eyeBallColor?: string;
  };
  gradient?: {
    type: "linear" | "radial";
    colorStops: Array<{ offset: number; color: string }>;
  };
  eyeMarker?: string; // Base64 image for custom eye marker
  template?: string; // Template identifier
}

// Calculate optimal QR version based on content length
function calculateQRVersion(contentLength: number, hasLogo: boolean): number {
  // When there's no logo, we can use lower versions since we don't need extra error correction
  if (!hasLogo) {
    if (contentLength <= 25) return 1;
    if (contentLength <= 50) return 2;
    if (contentLength <= 100) return 3;
    return 4;
  }
  // With logo we need higher versions for error correction
  if (contentLength <= 25) return 4;
  if (contentLength <= 50) return 6;
  if (contentLength <= 100) return 8;
  return 10;
}

export async function generateQRWithLogo(
  content: string,
  options: CustomizationOptions
): Promise<string> {
  try {
    // If no logo is present, generate a normal QR code with standard settings
    if (!options.logo) {
      try {
        return await QRCode.toDataURL(content, {
          version: calculateQRVersion(content.length, false),
          errorCorrectionLevel: "M", // Medium error correction for no logo
          margin: options.margin || 4, // Default margin if not specified
          color: {
            dark: options.color || "#000000", // Default to black if not specified
            light: options.backgroundColor || "#FFFFFF", // Default to white if not specified
          },
          type: "image/png",
          width: undefined, // Let the library determine optimal size
        });
      } catch (err) {
        console.error("Error in basic QR generation:", err);
        // Ultimate fallback with minimum options
        return await QRCode.toDataURL(content, { errorCorrectionLevel: "L" });
      }
    }

    // Step 1: Calculate optimal QR version and reserve center space for logo
    const version = calculateQRVersion(content.length, true);
    const size = 1024; // High resolution for better quality
    const moduleCount = version * 4 + 17; // QR modules per side
    const moduleSize = size / moduleCount;

    // Step 2: Create a canvas with higher version QR code
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Canvas context not available");
    }

    // Step 3: Calculate the reserved area for logo (30% of total size)
    const reservedAreaSize = Math.floor(moduleCount * 0.3);
    const reservedAreaStart = Math.floor((moduleCount - reservedAreaSize) / 2);
    const reservedAreaEnd = reservedAreaStart + reservedAreaSize;

    // Step 4: Generate QR code data segments with high error correction
    const segments = await QRCode.create(content, {
      version: version,
      errorCorrectionLevel: "H", // Highest error correction when logo is present
    });

    // Step 5: Draw QR code avoiding reserved area
    ctx.fillStyle = options.backgroundColor;
    ctx.fillRect(0, 0, size, size);

    ctx.fillStyle = options.color;
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        // Skip the reserved center area
        if (
          row >= reservedAreaStart &&
          row < reservedAreaEnd &&
          col >= reservedAreaStart &&
          col < reservedAreaEnd
        ) {
          continue;
        }

        // Check if this module should be dark
        if (segments.modules.get(row, col)) {
          ctx.fillRect(
            col * moduleSize,
            row * moduleSize,
            moduleSize,
            moduleSize
          );
        }
      }
    }

    // Step 6: Add logo in reserved area
    const logoImage = new Image();
    await new Promise<void>((resolve, reject) => {
      logoImage.onload = () => resolve();
      logoImage.onerror = reject;
      logoImage.src = options.logo as string;
    });

    // Calculate exact size based on reserved area (30% of QR size)
    const reservedPixelSize = reservedAreaSize * moduleSize;
    // Make logo exactly match the reserved area for perfect fit
    const logoSize = reservedPixelSize;
    const logoX = (size - logoSize) / 2;
    const logoY = (size - logoSize) / 2;

    // Draw white background exactly matching reserved area
    ctx.fillStyle = options.backgroundColor;
    const cornerRadius = Math.min(moduleSize, logoSize * 0.1);

    // Draw background with rounded corners exactly matching reserved area
    ctx.beginPath();
    ctx.moveTo(logoX + cornerRadius, logoY);
    ctx.lineTo(logoX + logoSize - cornerRadius, logoY);
    ctx.arcTo(
      logoX + logoSize,
      logoY,
      logoX + logoSize,
      logoY + cornerRadius,
      cornerRadius
    );
    ctx.lineTo(logoX + logoSize, logoY + logoSize - cornerRadius);
    ctx.arcTo(
      logoX + logoSize,
      logoY + logoSize,
      logoX + logoSize - cornerRadius,
      logoY + logoSize,
      cornerRadius
    );
    ctx.lineTo(logoX + cornerRadius, logoY + logoSize);
    ctx.arcTo(
      logoX,
      logoY + logoSize,
      logoX,
      logoY + logoSize - cornerRadius,
      cornerRadius
    );
    ctx.lineTo(logoX, logoY + cornerRadius);
    ctx.arcTo(logoX, logoY, logoX + cornerRadius, logoY, cornerRadius);
    ctx.closePath();
    ctx.fill();

    // Draw logo with rounded corners
    ctx.save();
    ctx.beginPath();

    // Create rounded clipping path for logo
    ctx.moveTo(logoX + cornerRadius, logoY);
    ctx.lineTo(logoX + logoSize - cornerRadius, logoY);
    ctx.arcTo(
      logoX + logoSize,
      logoY,
      logoX + logoSize,
      logoY + cornerRadius,
      cornerRadius
    );
    ctx.lineTo(logoX + logoSize, logoY + logoSize - cornerRadius);
    ctx.arcTo(
      logoX + logoSize,
      logoY + logoSize,
      logoX + logoSize - cornerRadius,
      logoY + logoSize,
      cornerRadius
    );
    ctx.lineTo(logoX + cornerRadius, logoY + logoSize);
    ctx.arcTo(
      logoX,
      logoY + logoSize,
      logoX,
      logoY + logoSize - cornerRadius,
      cornerRadius
    );
    ctx.lineTo(logoX, logoY + cornerRadius);
    ctx.arcTo(logoX, logoY, logoX + cornerRadius, logoY, cornerRadius);
    ctx.closePath();
    ctx.clip();

    // Draw logo exactly fitting the reserved area
    ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);
    ctx.restore();

    return canvas.toDataURL("image/png");
  } catch (error) {
    console.error("Error generating QR code with logo:", error);
    // Fallback to basic QR code if anything fails
    return QRCode.toDataURL(content, {
      errorCorrectionLevel: "M", // Use medium error correction for fallback
      margin: options.margin,
      color: {
        dark: options.color,
        light: options.backgroundColor,
      },
    });
  }
}
