import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import {
  Card,
  CardContent,
  Button,
  Typography,
  LinearProgress,
  Grid,
  Box,
} from '@mui/material';

export default function Emotiscan() {
  const [image, setImage] = useState(null);
  const [emotionResults, setEmotionResults] = useState(null);
  const [dominantEmotion, setDominantEmotion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [xaiExplanation, setXaiExplanation] = useState(null);
  const webcamRef = useRef(null);

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setImage(URL.createObjectURL(file));
  };

  const analyzeEmotion = async () => {
    setLoading(true);
    setTimeout(() => {
      const mockResponse = {
        data: {
          emotions: [
            { label: 'Happy', percentage: 70 },
            { label: 'Sad', percentage: 20 },
            { label: 'Neutral', percentage: 10 },
          ],
          xai_explanation:
            'This is a mock XAI explanation. Replace with real data when the backend is ready.',
        },
      };

      const emotions = mockResponse.data.emotions;
      setEmotionResults(emotions);

      const dominant = emotions.reduce((max, current) =>
        current.percentage > max.percentage ? current : max
      );
      setDominantEmotion(dominant);

      setXaiExplanation(mockResponse.data.xai_explanation);
      setLoading(false);
    }, 1000);
  };

  return (
    <Grid container spacing={3} padding={3}>
      <Grid item xs={12}>
        <Typography variant="h4" align="center" gutterBottom>
          Emotiscan
        </Typography>
      </Grid>

      {/* Webcam Capture */}
      <Grid item xs={12} sm={6}>
        <Card>
          <CardContent>
            <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                style={{ width: '100%', borderRadius: '10px' }}
              />
              <Button variant="contained" onClick={capture}>
                Capture from Webcam
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Image Upload */}
      <Grid item xs={12} sm={6}>
        <Card>
          <CardContent>
            <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
              <input type="file" accept="image/*" onChange={handleImageUpload} />
              {image && (
                <img
                  src={image}
                  alt="Uploaded"
                  style={{ maxWidth: '100%', borderRadius: '10px' }}
                />
              )}
              <Button variant="contained" onClick={analyzeEmotion} disabled={loading}>
                Analyze Emotion
              </Button>
              {loading && <LinearProgress style={{ width: '100%' }} />}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Emotion Analysis Results */}
      {emotionResults && (
        <Grid item xs={12}>
          <Card>
            <CardContent>
              {dominantEmotion && (
                <Typography variant="h5" align="center" gutterBottom>
                  Dominant Emotion: {dominantEmotion.label} (
                  {dominantEmotion.percentage.toFixed(2)}%)
                </Typography>
              )}

              {emotionResults.map((emotion) => (
                <Box key={emotion.label} marginBottom={2}>
                  <Typography variant="h6">{emotion.label}</Typography>
                  <LinearProgress variant="determinate" value={emotion.percentage} />
                  <Typography>{emotion.percentage.toFixed(2)}%</Typography>
                </Box>
              ))}

              {/* XAI Explanation */}
              <Typography variant="h6" gutterBottom>
                XAI Explanation:
              </Typography>
              <Typography>{xaiExplanation}</Typography>
            </CardContent>
          </Card>
        </Grid>
      )}
    </Grid>
  );
}
