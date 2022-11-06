import { Holistic } from "@mediapipe/holistic";
import React, { useRef, useEffect } from "react";
import * as holistic from "@mediapipe/holistic";
import * as cam from "@mediapipe/camera_utils";
import Webcam from "react-webcam";
import { sendRecord, sendIdentify  } from './Api';
import {toast, ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const identifySiganlButtonRef = useRef(null);
  const recordButtonRef = useRef(null);
  const recordInputRef = useRef(null);
  const wordsReftRef = useRef(null);
  const connect = window.drawConnectors;
  var camera = null;
  var record = false;
  var recording = false;
  var indexRecording = 0;
  var resultsRecord = []
  const framesToRecord = 15

  function onResults(results) {
    const videoWidth = webcamRef.current.video.videoWidth;
    const videoHeight = webcamRef.current.video.videoHeight;

    // Set canvas width
    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;

    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext("2d");
    
    //console.log(identifySiganlButtonRef.current)

    identifySiganlButtonRef.current.disabled = recording
    recordButtonRef.current.disabled = recording
    
    if(recording){
      if(record){       
        recordButtonRef.current.innerText = 'Gravando'
      }else{
        identifySiganlButtonRef.current.innerText = 'Capturando movimentos'
      }
      resultsRecord.push(results);
      indexRecording++;
      if(indexRecording == framesToRecord){
        if(record){          
          sendRecord(recordInputRef.current.value, resultsRecord).then(response=>{
            if(response.status == 200){              
              toast.success('Sinal adicionado com sucesso!', { position: toast.POSITION.BOTTOM_LEFT })
            }else{
              toast.error('Não foi possivel adicionar o sinal!', { position: toast.POSITION.BOTTOM_LEFT })
            }
          });
        }else{
          sendIdentify(resultsRecord).then(response => {
            if(response.status == 200){
              wordsReftRef.current.innerText = wordsReftRef.current.innerText.concat(" ", response.data.sign);
              toast.success('Sinal lido com sucesso!', { position: toast.POSITION.BOTTOM_LEFT })
            }else{
              toast.error('Sinal não pode ser identificado!', { position: toast.POSITION.BOTTOM_LEFT })
            }
          });          
        }
        recording = false;
        identifySiganlButtonRef.current.innerText = 'Identificar Sinal'
        recordButtonRef.current.innerText = 'Gravar'
      }
    }

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);  
    // Only overwrite existing pixels.
    canvasCtx.globalCompositeOperation = 'source-in';
    canvasCtx.fillStyle = '#00FF00';
    canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);
  
    // Only overwrite missing pixels.
    canvasCtx.globalCompositeOperation = 'destination-atop';
    canvasCtx.drawImage(
        results.image, 0, 0, canvasElement.width, canvasElement.height);
  
    canvasCtx.globalCompositeOperation = 'source-over';
    connect(canvasCtx, results.poseLandmarks, holistic.POSE_CONNECTIONS,
                   {color: '#000000', lineWidth: 1});
    connect(canvasCtx, results.leftHandLandmarks, holistic.HAND_CONNECTIONS,
                   {color: '#CC0000', lineWidth: 5});
    connect(canvasCtx, results.leftHandLandmarks,
                  {color: '#00FF00', lineWidth: 2});
    connect(canvasCtx, results.rightHandLandmarks, holistic.HAND_CONNECTIONS,
                   {color: '#00CC00', lineWidth: 5});
    connect(canvasCtx, results.rightHandLandmarks,
                  {color: '#FF0000', lineWidth: 2});
    canvasCtx.restore();
  }

  function clickToIdentify(){
    record = false;
    recording = true;
    indexRecording = 0;
    resultsRecord = [];
  }

  function clickToRecord(){  
    record = true;  
    recording = true;
    indexRecording = 0;
    resultsRecord = [];
  }

  function clickClean(){
    wordsReftRef.current.innerText = '';
  }

  // }

  // setInterval(())
  useEffect(() => {    
    const holistic = new Holistic({locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
    }});

    holistic.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      smoothSegmentation: false,
      refineFaceLandmarks: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });
    holistic.onResults(onResults);

    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null
    ) {
      camera = new cam.Camera(webcamRef.current.video, {
        onFrame: async () => {
          await holistic.send({ image: webcamRef.current.video });
        },
        width: 640,
        height: 480,
      });
      camera.start();
    }
  }, []);
  return (
    <center>
    <div className="header">
      <div className="title">
        INTELIGÊNCIA ARTIFICIAL NA IDENTIFICAÇÃO DA LINGUAGEM DE SINAIS PARA AUXILIAR DEFICIENTES AUDITIVOS
      </div>
    </div>
    <div className="rec">
      <input ref={recordInputRef}  >
        </input>
        <button ref={recordButtonRef} onClick={clickToRecord}>Gravar</button>
    </div>
    <div className="record">      
      <button ref={identifySiganlButtonRef} className='button' onClick={clickToIdentify}>
        Identificar Sinal
      </button> 
      <div>
        <div ref={wordsReftRef} className='result'></div>
        <button className="cleanButton" onClick={clickClean}>
          Limpar texto
      </button> 
      </div>     
    </div>
      <div className="App">
        <canvas
          ref={canvasRef}
          className="output_canvas webcamCapture"
        ></canvas>        
        <Webcam
          ref={webcamRef}
          className='webcam'
        />{" "}  
      </div> 
      <ToastContainer autoClose={5000} hideProgressBar={true}/>
    </center>
  );
}

export default App;
