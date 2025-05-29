import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionIcon from "@mui/icons-material/Description";
import { getAttachmentUrl } from "../../utils/api";

interface AttachmentPreviewProps {
  attachmentUrl: string;
  attachmentType?: string;
  isCurrentUser: boolean;
}

const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({
  attachmentUrl,
  attachmentType = "",
  isCurrentUser,
}) => {
  const getFileIcon = () => {
    if (attachmentType.startsWith("application/pdf")) {
      return <PictureAsPdfIcon sx={{ fontSize: "2rem" }} />;
    }
    if (attachmentType.startsWith("text/")) {
      return <DescriptionIcon sx={{ fontSize: "2rem" }} />;
    }
    return <AttachFileIcon sx={{ fontSize: "2rem" }} />;
  };

  const getFileExtension = (url: string) => {
    const fileName = url.split("/").pop() || "";
    return fileName.split(".").pop()?.toUpperCase() || "FILE";
  };

  if (attachmentType.startsWith("image/")) {
    return (
      <Box
        sx={{
          position: "relative",
          mt: 1,
          "&:hover": {
            "& .hover-overlay": {
              opacity: 1,
            },
          },
        }}
      >
        <img
          src={getAttachmentUrl(attachmentUrl)}
          alt="attachment"
          style={{
            maxWidth: "100%",
            maxHeight: 200,
            borderRadius: 8,
            cursor: "pointer",
          }}
          onClick={() => window.open(getAttachmentUrl(attachmentUrl), "_blank")}
        />
        <Box
          className="hover-overlay"
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 2,
            opacity: 0,
            transition: "opacity 0.2s",
            cursor: "pointer",
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: "white", fontWeight: "medium" }}
          >
            Click to open
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Paper
      component="a"
      href={getAttachmentUrl(attachmentUrl)}
      target="_blank"
      rel="noopener noreferrer"
      sx={{
        mt: 1,
        p: 1.5,
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        textDecoration: "none",
        color: isCurrentUser ? "primary.contrastText" : "text.primary",
        backgroundColor: isCurrentUser
          ? "rgba(255, 255, 255, 0.1)"
          : "rgba(0, 0, 0, 0.04)",
        transition: "transform 0.2s",
        cursor: "pointer",
        "&:hover": {
          transform: "scale(1.02)",
        },
      }}
    >
      {getFileIcon()}
      <Box>
        <Typography variant="body2" sx={{ fontWeight: "medium" }}>
          {getFileExtension(attachmentUrl)}
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.8 }}>
          Click to open
        </Typography>
      </Box>
    </Paper>
  );
};

export default AttachmentPreview;
