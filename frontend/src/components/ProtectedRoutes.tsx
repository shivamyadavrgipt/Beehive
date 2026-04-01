import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated, getUserRole } from "../utils/auth";
import { useState, useEffect } from 'react';
import { apiUrl } from '../utils/api';
import { getToken } from '../utils/auth';

interface ProtectedMediaProps {
  filename: string;
  isPdf?: boolean;
  className?: string;
  alt?: string;
}

interface ProtectedAudioProps {
  filename: string;
  className?: string;
  onEnded?: () => void;
}


export const AdminRoute = () => {
  if (!isAuthenticated()) {
    return <Navigate to="/sign-in" replace />;
  }

  if (getUserRole() !== "admin") {
    return <Navigate to="/no-access" replace />;
  }

  return <Outlet />;
};

export const UserRoute = () => {
  const authenticated = isAuthenticated();

  if (!authenticated) {
    return <Navigate to="/sign-in" replace />;
  }

  return <Outlet />;
};

export const ProtectedMedia = ({ filename, isPdf = false, className = '', alt = 'Secure media' }: ProtectedMediaProps) => {
  const [src, setSrc] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let objectUrl: string | null = null;

    const fetchMedia = async () => {
      try {
        const response = await fetch(apiUrl(`/api/files/${filename}`), {
          headers: {
            'Authorization': `Bearer ${getToken()}`
          },
          credentials: 'include'
        });

        if (!response.ok) throw new Error('Failed to load media');

        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      } catch (err) {
        console.error("Error loading protected media:", err);
        setError(true);
      }
    };

    if (filename) {
      fetchMedia();
    }

    // memory cleanup to prevent browser memory leaks
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [filename]);

  if (error) {
    return <div className={`flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-500 ${className}`}>Failed to load</div>;
  }

  if (!src) {
    return <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 ${className}`}></div>;
  }

  if (isPdf) {
    return <iframe src={src} className={className} title={alt} />;
  }

  return <img src={src} alt={alt} className={className} />;
};

export const ProtectedAudio = ({ filename, className = '', onEnded }: ProtectedAudioProps) => {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;

    const fetchAudio = async () => {
      try {
        const response = await fetch(apiUrl(`/api/audio/${filename}`), {
          headers: { 'Authorization': `Bearer ${getToken()}` },
          credentials: 'include'
        });

        if (response.ok) {
          const blob = await response.blob();
          objectUrl = URL.createObjectURL(blob);
          setSrc(objectUrl);
        }
      } catch (error) {
        console.error("Failed to load secure audio", error);
      }
    };

    fetchAudio();

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [filename]);

  if (!src) return <div className="text-sm text-gray-500 p-2 animate-pulse">Loading secure audio...</div>;

  return (
    <audio
      controls
      src={src}
      className={className}
      onEnded={onEnded}
      autoPlay
    />
  );
};