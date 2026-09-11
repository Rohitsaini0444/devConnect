const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { v4: uuidv4 } = require("uuid");

const s3Client = require("../config/s3");

const getProfilePhotoUploadUrl = async (req, res) => {
    try {
        const userId = req.user.id;

        const { contentType } = req.body;

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif",
            "image/jpg"
        ];

        if (!allowedTypes.includes(contentType)) {
            return res.status(400).json({
                message: "Invalid image type"
            });
        }

        const extension = contentType.split("/")[1];

        const key =
            `users/${userId}/profile/${uuidv4()}.${extension}`;

        const command = new PutObjectCommand({
            Bucket: process.env.S3_PROFILE_BUCKET,
            Key: key,
            ContentType: contentType
        });

        const uploadUrl = await getSignedUrl(
            s3Client,
            command,
            {
                expiresIn: 300
            }
        );

        const photoUrl =
            `${process.env.CLOUDFRONT_DOMAIN}/${key}`;

        return res.json({
            uploadUrl,
            key,
            photoUrl
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Failed to generate upload URL"
        });
    }
};

module.exports = {
    getProfilePhotoUploadUrl
};
