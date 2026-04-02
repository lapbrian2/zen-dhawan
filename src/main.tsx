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
import { CustomBounce } from 'gsap/CustomBounce'
import { CustomWiggle } from 'gsap/CustomWiggle'
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin'
import { Physics2DPlugin } from 'gsap/Physics2DPlugin'
import { PhysicsPropsPlugin } from 'gsap/PhysicsPropsPlugin'
import { EasePack } from 'gsap/EasePack'
import { registerEases } from './animations/eases'
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
  CustomBounce,
  CustomWiggle,
  MorphSVGPlugin,
  Physics2DPlugin,
  PhysicsPropsPlugin,
  EasePack,
)

registerEases()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
