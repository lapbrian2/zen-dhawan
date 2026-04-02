import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { Draggable } from 'gsap/Draggable'
import { InertiaPlugin } from 'gsap/InertiaPlugin'
import { Flip } from 'gsap/Flip'
import { Observer } from 'gsap/Observer'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import { SplitText } from 'gsap/SplitText'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'
import { TextPlugin } from 'gsap/TextPlugin'
import { CustomEase } from 'gsap/CustomEase'
import { EasePack } from 'gsap/EasePack'
import App from './App'
import './reset.css'
import './App.css'

gsap.registerPlugin(
  useGSAP,
  Draggable,
  InertiaPlugin,
  Flip,
  Observer,
  DrawSVGPlugin,
  MotionPathPlugin,
  SplitText,
  ScrambleTextPlugin,
  TextPlugin,
  CustomEase,
  EasePack,
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
