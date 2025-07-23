import * as React from 'react';
import {
  SafeAreaView,
  View,
  Dimensions,
  Image,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from 'react-native';
import * as Progress from 'react-native-progress';
import { AuthContext } from './../contexts/AuthContext';
import ImageResizer from 'react-native-image-resizer';
import { useQueryClient } from '@tanstack/react-query';
import * as API from './../lib/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DocumentPicker from 'react-native-document-picker';
import Icon from 'react-native-vector-icons/dist/FontAwesome5';
import { useIsFocused } from '@react-navigation/native';
import amplitudeService from '../utils/analytics/amplitude';
import retentionManager from '../utils/retention/retentionManager';
import appsFlyerService from '../utils/analytics/appsflyer';


const sampleUploadImage = {
  width: 289,
  height: 486,
  uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASEAAAHmCAIAAACzkq9AAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAL1FJREFUeF7tneuV7KqSrff1oE1pM8qgNCd9qX/tRpmyrnhHQIACUiglMWvscc7KTJ4fMRWAePy/f//+/Yc/EACBeQT+93//d17iSBkEFifg9bW5MvyBAAjMIOAfMTOSRpogAAJpIAYWIAACkwjAj00Ci2RBwBOAxmAKIDCXADQ2ly9SBwFoDDYAAnMJQGNz+SJ1EOjT2O/rv9evAA3fOyjgsCaH9nNEq7HfX6Mtb0O/r6g0fO+tCnzcU2YxDhovrdXY3/uHrIhJzgzfO8rgsCaHIzXmzejn/f75ef+xlI154XsnM3BYj8OuzLR+LI01NlNiY7IwBsH3bqwKDmtx2JVY2NSyHxAhQAAEhgjo/dhQ8ogEAssTgMaWNwEAmEwAGpsMGMkvTwAaW94EAGAyAWhsMmAkvzwBaGx5EwCAyQSgscmAkfzyBKCx5U0AACYTgMYmA0byyxOAxpY3AQCYTAAamwwYyS9PABobMYFtHbT981sQ6MYWsy6Yb3SJe4LcUmqySch8EZJKqe0UiCVOVmcLmYYdEo2ftswapW1HHCG3YhxobLDVN/Pb/jaVxfh810++JTp9NjFTLBe9toE6L5xVZBSWlQDdBMGTMYHTZtpXeCKYNN0+nL+YfL20WdFYmoPoVosGjQ22uFXKm1qxVmPRaq1EnKUrNbZFyM56MGmkr/JkSJG2n/jGP/tFqLxaY8YP5xsIBwkuEw0aG2xqq7E/I45gqRWNCfLxIU3c7c8YuspwJQdoPRJ1VnyLOlNRpg1asPjvsrTsG+f/BpGtGg0aG2x5rzE7vnLGW2gsG4iljH5fXp6vX2fBOjcmh8qkQk6EYGIo/Jh7PPjuIhkV5p6S/mTc7iCvhaNBY4ONHzUWPYnejzlZREf4sgc47Jejy4/lAydRY6UDbPoxDMb2G0kIAY0NYbOzBswLvH7b4zGajYn7ejld0X/vFqVvPJaPuHhfkSm24UiLeRTN42C3JisFgMYGW5tqzE3TmaFVfaaO9Qdt/4tN/IvHVpZFsxG184p2KiWUKfdjO0+EpCxhOgSTHl1GA4114fKByRiFKqXxPspypl0z8imbR98pEH1nRV0K/Z6r0MifDNPYq73nSYtffWkbaSofCiN0nxYHGntai6I+VyMAjV2tRVCepxGAxp7WoqjP1QhAY1drEZTnaQSgsae1KOpzNQLQ2NVaBOV5GgFo7GktivpcjUCfxmrLAfC9a1dwWJNDW9Vaja12dxvq69Wy2J19ve2u8ZlajfHFALjjz3EDh9U5HKmxLS23dwh3/IGDMyxw0AhsC6P1Y7jjLwANY67NxHDXoZPa0hz2habX2H5aCAECIFASgMZgFSAwlwA0NpcvUgcBaAw2AAJzCUBjc/kidRCAxmADIDCXADQ2ly9SBwFoDDYAAnMJQGNz+SJ1EOjQGDsw1r3aT6sYyRUk22FJ4Xt7UmdY1xfim9ObYsTtoEF3uBJPavtCjrjbYi4dfgJUOpiJHOTEVmCGow4tDn+IL1+QuJsxApjjjz+lIO1cIC3l27X8hllQftQxKZSLmZUzWnb8XhlMV9sOjbkE3TnS/p/89D4rjGDdKRw5EzCsu4mLHt2at/IgwJB+UEu+YKdVOcvHF9L9M5b89XqRIxBTXeJhibH',
};

export default function InvoiceUploadScreen(props) {
  const [presignedURLS, setPresignedURLS] = React.useState({});
  

  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [uploadStatus, setUploadStatus] = React.useState('idle'); // idle, uploading, success, error
  const [statusMessage, setStatusMessage] = React.useState('');
  const [isHandlingUpload, setIsHandlingUpload] = React.useState(false);
  const [uploadStartTime, setUploadStartTime] = React.useState(null);
  const [processStartTime, setProcessStartTime] = React.useState(null);

  const { session } = React.useContext(AuthContext);
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();

  const screenWidth = Math.round(Dimensions.get('window').width);
  const screenHeight = Math.round(Dimensions.get('window').height);

  // Progress tracking reference
  const prevProgressRef = React.useRef(0);

  // AGREGAR función helper para verificar primer ticket:
  const checkIfFirstTicket = async (userId) => {
    try {
      // Verificar si es el primer ticket del usuario
      // Esto depende de tu API/lógica existente
      const userTickets = await API.getTickets(session.token, 'all');
      return userTickets.tickets && userTickets.tickets.length === 1; // Si solo tiene 1 ticket, es el primero
    } catch (error) {
      console.error('Error checking first ticket:', error);
      return false;
    }
  };

  // AGREGAR función helper para obtener user ID actual:
  const getCurrentUserId = async () => {
    try {
      // Obtener user ID del contexto de autenticación
      return session.userId;
    } catch (error) {
      console.error('Error getting current user ID:', error);
      return null;
    }
  };

  // Track screen view when focused
  React.useEffect(() => {
    if (isFocused) {
      const source = getUploadSource();

      amplitudeService.trackEvent('Invoice_Upload_Screen_Viewed', {
        upload_type: source
      });
    }
  }, [isFocused]);

  // Determine upload source from route params
  const getUploadSource = () => {
    if (props.route.params?.manualEntry) {
      return 'manual';
    } else if (props.route.params?.pdfUpload) {
      return 'pdf';
    } else if (props.route.params?.image?.uri) {
      return 'photo';
    } else {
      return 'unknown';
    }
  };

  const imageOriginal = _try(() => {
    if (props.route.params.image.uri) {
      return props.route.params.image;
    } else {
      throw new Error();
    }
  }, sampleUploadImage);

  React.useEffect(() => {
    if (presignedURLS.urlOriginal === undefined) return;
    if (presignedURLS.urlSmall === undefined) return;

    console.log({ presignedURLS });

    // start upload once we have the presigned URLs
    startUploadSmallerImage();
  }, [presignedURLS]);

  const handleUploadButton = async () => {
    // Track upload button tap
    amplitudeService.trackEvent('Upload_Button_Tapped', {
      image_width: imageOriginal.width,
      image_height: imageOriginal.height,
      has_uri: !!imageOriginal.uri
    });

    setUploadStartTime(Date.now());
    setIsHandlingUpload(true);
    setUploadStatus('uploading');
    setStatusMessage('Preparando ticket...');
    setUploadProgress(0);

    try {
      var data = await API.getPresignedUploadURLS();
      if (typeof data !== 'object') throw new Error('Invalid data');
      if (data === null) throw new Error('Invalid data');
      if (data.urlOriginal === undefined) throw new Error('Invalid data');
      if (data.urlSmall === undefined) throw new Error('Invalid data');

      setPresignedURLS(data);
    } catch (e) {
      console.error('Error getting presigned URLs:', e);
      setUploadStatus('error');
      setStatusMessage('Error de conexión');
      setIsHandlingUpload(false);

      // Track error
      amplitudeService.trackEvent('Upload_Presigned_URL_Error', {
        error: e.message || 'Unknown error'
      });

      // Show error alert
      Alert.alert(
        'Error de conexión',
        'No pudimos conectar con el servidor. Por favor intenta nuevamente.',
        [{ text: 'OK' }]
      );
    }
  };

  const startUploadSmallerImage = async () => {
    const xhr = new XMLHttpRequest();
    xhr.onload = onFinishedUploading;

    xhr.upload.onprogress = event => {
      const _progress = event.loaded / event.total;
      console.log('progress', _progress, event.total, event.loaded);
      setUploadProgress(_progress);

      // Track progress at important milestones
      if (_progress >= 0.25 && prevProgressRef.current < 0.25) {
        amplitudeService.trackEvent('Upload_Progress', {
          progress: 25,
          time_elapsed_ms: Date.now() - uploadStartTime
        });
        prevProgressRef.current = 0.25;
      } else if (_progress >= 0.5 && prevProgressRef.current < 0.5) {
        amplitudeService.trackEvent('Upload_Progress', {
          progress: 50,
          time_elapsed_ms: Date.now() - uploadStartTime
        });
        prevProgressRef.current = 0.5;
      } else if (_progress >= 0.75 && prevProgressRef.current < 0.75) {
        amplitudeService.trackEvent('Upload_Progress', {
          progress: 75,
          time_elapsed_ms: Date.now() - uploadStartTime
        });
        prevProgressRef.current = 0.75;
      }
    };

    xhr.upload.onerror = event => {
      setStatusMessage('Error conexión');
      setUploadProgress(100);

      // Track upload error
      amplitudeService.trackEvent('Upload_Network_Error', {
        time_elapsed_ms: Date.now() - uploadStartTime
      });

      onUploadError();
    };

    xhr.onerror = event => {
      setStatusMessage('Error conexión');
      setUploadProgress(100);

      // Track error
      amplitudeService.trackEvent('Upload_Request_Error', {
        time_elapsed_ms: Date.now() - uploadStartTime
      });

      onUploadError();
    };

    setStatusMessage('Procesando ticket...');
    setUploadProgress(0);
    prevProgressRef.current = 0;

    const uploadURL = presignedURLS.urlSmall;
    const _imageOriginal = imageOriginal;
    var _imageSmall = undefined;

    try {
      let imageWidth = _imageOriginal.width;
      let sampleMaxWidth = 2560;
      let divisionFactor = 1.25;
      let currentWidth = imageWidth;

      while (currentWidth >= sampleMaxWidth) {
        currentWidth = imageWidth / divisionFactor;
        divisionFactor += 0.01;
      }

      try {
        _imageSmall = await ImageResizer.createResizedImage(
          _imageOriginal.uri,
          Math.round(_imageOriginal.width / divisionFactor),
          Math.round(_imageOriginal.height / divisionFactor),
          'JPEG',
          90,
          0,
          null,
        );
      } catch (e) {
        console.error('Error resizing image:', e);
        _imageSmall = _imageOriginal;
      }
    } catch (e) {
      console.error('Error in image preparation:', e);
      _imageSmall = _imageOriginal;
    }

    // This is the key fix - use PUT method and set Content-Type header properly
    try {
      xhr.open('PUT', uploadURL, true);
      xhr.setRequestHeader('Content-Type', 'image/jpeg');
      xhr.send({uri: _imageSmall.uri, type: 'image/jpeg', name: 'small.jpg'});
    } catch (e) {
      console.error('Error sending request:', e);
      onUploadError();
    }
  };

  const onUploadError = async () => {
    setTimeout(() => {
      setIsHandlingUpload(false);
      setUploadStatus('idle');

      Alert.alert(
        'Ups...',
        'Sucedio un error de conexión al subir tu ticket. Favor intentar nuevamente',
        [
          {
            text: 'Continuar',
          },
        ],
        { cancelable: false },
      );
    }, 1000);
  };

  const onFinishedUploading = async () => {
    try {
      // Track upload completion
      const uploadTime = Date.now() - uploadStartTime;
      amplitudeService.trackEvent('Upload_Completed', {
        time_elapsed_ms: uploadTime
      });

      setProcessStartTime(Date.now());
      setUploadProgress(1);
      setStatusMessage('Ticket subido correctamente');

      const uploadURL = presignedURLS.urlSmall;
      console.log('onFinishedUploading');

      console.log('uploadTicket');
      const uploadedTicket = await API.createTicket({
        token: session.token,
        scanURL: uploadURL.split(/[?#]/)[0],
      });
      console.log({ uploadedTicket });

      const __ = await queryClient.invalidateQueries('invoicesQuery');
      console.log('Refreshed tickets after upload');

      // ✅ AGREGAR ESTO DESPUÉS DE CREAR EL TICKET:
      if (uploadedTicket && uploadedTicket.ticket && uploadedTicket.ticket.id) {
        const userId = await getCurrentUserId(); // Tu función para obtener user ID
        
        if (userId) {
          // Check if it's the first ticket
          const isFirstTicket = await checkIfFirstTicket(userId);
          
          const ticketProperties = {
            ticket_id: uploadedTicket.ticket.id,
            amount: 0, // No amount available at creation time
            type: 'invoice',
            timestamp: new Date().toISOString()
          };
          
          if (isFirstTicket) {
            // Track first ticket milestone
            await retentionManager.trackFirstTicket(userId, ticketProperties);
          } else {
            // Track regular ticket creation
            await retentionManager.trackTicketCreated(userId, ticketProperties);
          }
        }
      }

      // Track ticket creation success (existing code)
      const processingTime = Date.now() - processStartTime;
      amplitudeService.trackEvent('Ticket_Created', {
        ticket_id: uploadedTicket.ticket.id,
        processing_time_ms: processingTime,
        total_time_ms: uploadTime + processingTime
      });
      await appsFlyerService.trackRevenueEvent('Ticket_Created', {
        ticket_id: uploadedTicket.ticket.id,
        amount: 0,
        processing_time_ms: processingTime
      });

      console.log({ uploadedTicket });
      setUploadStatus('success');

      // Navigate to next screen
      props.navigation.navigate('invoiceTypeScreen', {
        ticketID: uploadedTicket.ticket.id,
      });

    } catch (e) {
      // Track ticket creation error
      amplitudeService.trackEvent('Ticket_Creation_Error', {
        error: e.message || 'Unknown error',
        time_elapsed_ms: Date.now() - processStartTime
      });

      setUploadStatus('error');
      setStatusMessage('Error procesando ticket');

      Alert.alert(
        'Ups...',
        'Sucedio un error inesperado al subir tu ticket. Favor intentalo mas tarde',
        [
          {
            text: 'Continuar',
            onPress: () => props.navigation.goBack(),
          },
        ],
        { cancelable: false },
      );
    } finally {
      setIsHandlingUpload(false);
    }
  };

  return (
    <>
      <View
        style={{
          flex: 1,
          paddingTop: insets.top,
          backgroundColor: 'black',
          alignItems: 'center',
          justifyContent: 'flex-start',
        }}>
        {/* Show upload progress overlay when uploading */}
        {uploadStatus !== 'idle' && (
          <View style={styles.progressOverlay}>
            <View style={styles.progressContainer}>
              <Text style={styles.progressTitle}>{statusMessage}</Text>
              <Progress.Bar
                progress={uploadProgress}
                width={200}
                height={10}
                color="#481ECC"
                unfilledColor="#e0e0e0"
                borderWidth={0}
                style={{ marginVertical: 16 }}
              />
              <Text style={styles.progressPercentage}>
                {Math.round(uploadProgress * 100)}%
              </Text>

              {uploadStatus === 'error' && (
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setUploadStatus('idle');
                    amplitudeService.trackEvent('Upload_Cancelled_By_User');
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
              )}

              {uploadStatus === 'uploading' && (
                <ActivityIndicator color="#481ECC" style={{ marginTop: 10 }} />
              )}
            </View>
          </View>
        )}

        <View
          style={{
            width: (screenWidth / 6) * 5,
            height: '100%',
          }}>
          <Image
            source={imageOriginal}
            style={{
              resizeMode: 'contain',
              width: '100%',
              height: '100%',
            }}
          />
        </View>
      </View>
      <View
        style={{
          height: (screenHeight / 5) * 1,
          backgroundColor: 'black',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <TouchableOpacity
          onPress={handleUploadButton}
          disabled={isHandlingUpload}
          style={{
            backgroundColor: '#481ECC',
            width: screenWidth / 1.5,
            paddingVertical: 16,
            paddingHorizontal: 16,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 12,
            opacity: isHandlingUpload ? 0.7 : 1
          }}>
          <Text style={{ color: '#F7F7F7', fontSize: 18, fontWeight: 'bold' }}>
            {isHandlingUpload ? 'SUBIENDO...' : 'AGREGAR TICKET'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            amplitudeService.trackEvent('Upload_Screen_Cancelled');
            props.navigation.goBack();
          }}
          style={{
            paddingBottom: 4,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottomWidth: 1,
            borderBottomColor: 'white',
            marginTop: 16,
          }}>
          <Text style={{ color: '#F7F7F7', fontSize: 16 }}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  progressOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  progressContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  progressPercentage: {
    fontSize: 14,
    color: '#666',
  },
  cancelButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: '500',
  }
});

// Utility function to safely try expressions with a fallback
function _try(fn, fallback) {
  try {
    return fn();
  } catch (e) {
    return fallback;
  }
}