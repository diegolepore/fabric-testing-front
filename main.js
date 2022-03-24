import './style.css'
import { fabric } from 'fabric'

function initCanvas(id) {
  return new fabric.Canvas(id, {
    width: 500,
    height: 500,
    selection: false,
    // backgroundColor: 'green',
  })
}

function setBackgroundImage(url, canvas) {
  fabric.Image.fromURL(
    url, 
    (image) => {
      canvas.backgroundImage = image
      canvas.requestRenderAll()
    }
  )
}

function setCrosshairCursor(canvas) {
  canvas.setCursor('grabbing')
  canvas.requestRenderAll()
}

function toggleMode(mode) {
  if(currentMode === mode) {
    currentMode = ''

    if(mode === modes.drawing) {
      canvas.isDrawingMode = false
      canvas.requestRenderAll()
    }
    
  } else {
    
    if(mode === modes.drawing) {
      // canvas.freeDrawingBrush = new fabric.CircleBrush(canvas)
      // canvas.freeDrawingBrush = new fabric.SprayBrush(canvas)
      canvas.freeDrawingBrush.color = color
      // canvas.freeDrawingBrush.width = 15
      canvas.isDrawingMode = true
      canvas.requestRenderAll()
    }
    
    if(mode === modes.pan) {
      canvas.isDrawingMode = false
      canvas.requestRenderAll()
    }

    currentMode = mode
  }
}

function setPanEvents(canvas) {
  canvas.on('mouse:move', (event) => {
    // console.log(e)
    if(mousePressed && currentMode === modes.pan) {
      const mEvent = event.e
      const delta = new fabric.Point(mEvent.movementX, mEvent.movementY)
      setCrosshairCursor(canvas)
      canvas.relativePan(delta)
    }
  })

  canvas.on('mouse:down', (event) => {
    mousePressed = true
    if(currentMode === modes.pan) {
      setCrosshairCursor(canvas)
    }
  })

  canvas.on('mouse:up', (event) => {
    mousePressed = false
    canvas.setCursor('default')
    canvas.requestRenderAll()
  })
}

function createRect(canvas) {
  const centerObj = canvas.getCenter()
  console.log(centerObj)
  const rect = new fabric.Rect({
    width: 100,
    height: 100,
    fill: 'purple',
    top: -50, 
    left: centerObj.left, 
    originX: 'center',
    originY: 'center',
    cornerColor: 'white',
    // objectCaching: false
  })

  // Object.assign(rect, centerObj)

  canvas.add(rect)
  canvas.requestRenderAll()
  rect.animate('top', centerObj.top, {
    onChange: canvas.requestRenderAll.bind(canvas)
  })

  rect.on('selected', () => {
    // rect.fill = 'white'
    // rect.dirty = true
    rect.set('fill', 'white')
    canvas.requestRenderAll(canvas)
  })
  
  rect.on('deselected', () => {
    // rect.fill = 'green'
    // rect.dirty = true
    rect.set('fill', 'purple')
    canvas.requestRenderAll(canvas)
  })  

}

function createCirc(canvas) {
  const centerObj = canvas.getCenter()
  console.log(centerObj)
  const circle = new fabric.Circle({
    // width: 100,
    // height: 100,
    radius: 50,
    fill: 'orange',
    top: -50, 
    left: centerObj.left, 
    originX: 'center',
    originY: 'center',
    cornerColor: 'white',
    lockScalingX: true,
    lockScalingY: true,
    // objectCaching: false
  })

  // Object.assign(circle, centerObj)

  canvas.add(circle)
  canvas.requestRenderAll()

  circle.animate('top', canvas.height - 50, {
    onChange: canvas.requestRenderAll.bind(canvas),
    duration: 300,
    onComplete: () => {
      circle.animate('top', centerObj.top, {
        onChange: canvas.requestRenderAll.bind(canvas),
        easing: fabric.util.ease.easeOutBounce,
        duration: 500
      })
    }
  })

  circle.on('selected', () => {
    circle.set('fill', 'white')
    canvas.requestRenderAll(canvas)
  })
  
  circle.on('deselected', () => {
    circle.set('fill', 'orange')
    canvas.requestRenderAll(canvas)
  }) 
}

function groupObjects(canvas, group, shouldGroup) {
  if(shouldGroup) {
    const objects = canvas.getObjects()
    group.val = new fabric.Group(objects, { cornerColor: 'white' })
    clearCanvas(canvas, svgState)
    canvas.add(group.val)
    canvas.requestRenderAll(canvas)
  } else {
    group.val.destroy()
    const oldGroup = group.val.getObjects()
    // clearCanvas(canvas, svgState)
    // canvas.remove(group.val)
    canvas.add(...oldGroup)
    group.val = null
    canvas.requestRenderAll(canvas)
  }
}

const clearCanvas = (canvas, state) => {
    state.val = canvas.toSVG()
    console.log(state.val)
    // fabric.loadSVGFromString(state.val)
    canvas.getObjects().forEach((o) => {
        if(o !== canvas.backgroundImage) {
            canvas.remove(o)
        }
    })
}

const restoreCanvas = (canvas, state, bgUrl) => {
  console.log(state.val)
    if (state.val) {
        fabric.loadSVGFromString(state.val, objects => {
            console.log(objects)
            objects = objects.filter(o => o['xlink:href'] !== bgUrl)
            canvas.add(...objects)
            canvas.requestRenderAll()
        })
    }
}

const imgAdded = (e) => {
    // console.log(e)
    // const inputElem = document.getElementById('myImg')
    // const file = inputElem.files[0];
    const file = new File([e.target.files[0]], 'fileName') 
    const reader = new FileReader()

    reader.onloadend = async (e) => {
        // console.log(e.target.result)
        fabric.Image.fromURL(e.target.result, img => {
            canvas.add(img)
            canvas.requestRenderAll()
        })
    }
    reader.readAsDataURL(file)
}

function saveCanvas() {
    // convert canvas to a json string
    var json = JSON.stringify( canvas.toJSON() );

    fetch('https://fabric-testing-node-server.vercel.app/designs/h02O7zrlN4IzpI7xP1E1', {
      method: 'PUT', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, *cors, same-origin
      headers: {
        'Content-Type': 'application/json'
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: json // body data type must match "Content-Type" header
    }).then((response) => {
      // loadCanvas()
      console.log(response.json())
      loadCanvas('h02O7zrlN4IzpI7xP1E1')
    });

    console.log(json)

    // save via xhr
    // $.post('/save', { json : json }, function(resp){ 
    //     // do whatever ...
    // }, 'json');
}


// function clearCanvas(canvas, state) {
//   state.val = canvas.toSVG()

//   canvas.getObjects().forEach((obj) => {
//     if(obj !== canvas.backgroundImage) {
//       canvas.remove(obj)
//     }
//   })
// }

// function restoreCanvas(canvas, state, bgImg) {
//   if(state.val) {
//     console.log(state.val)
//     fabric.loadSVGFromString(state.val,function (objects) {
//       console.log(objects)
//       // objects = objects.filter( o => o['xlink:href'] !== bgImg)
//       // canvas.add(...objects)
//       // canvas.requestRenderAll(canvas)
//     })
//   }
// }

let group = {}
let mousePressed = false
let currentMode
let color = '#000000'
let svgState = {}
let bgImg = 'https://images.unsplash.com/photo-1647655806923-e8202f4f2b8c?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80'
const modes = {
  pan: 'pan',
  drawing: 'drawing'
}

const canvas = initCanvas('canvas')
setBackgroundImage(
  bgImg,
  canvas
)

async function loadCanvas(id) {

  fetch(`https://fabric-testing-node-server.vercel.app/designs/${id}`)
  .then(response => response.json())
  .then(data => {
    console.log(data)
    // parse the data into the canvas
    canvas.loadFromJSON(JSON.parse(data.jsonString));
  });

  // re-render the canvas
  canvas.requestRenderAll()
}


loadCanvas('h02O7zrlN4IzpI7xP1E1')

setPanEvents(canvas)


// document.querySelector('#togglePan').addEventListener('click', () => toggleMode(modes.pan))

document.querySelector('#toggleDrawing').addEventListener('click', () => toggleMode(modes.drawing))

document.querySelector('#colorPicker').addEventListener('change', (event) => {
  console.log(event.target.value)
  color = event.target.value
  canvas.freeDrawingBrush.color = event.target.value
})

document.querySelector('#clearBtn').addEventListener('click', () => clearCanvas(canvas, svgState))

document.querySelector('#rect').addEventListener('click', () => createRect(canvas))
document.querySelector('#circ').addEventListener('click', () => createCirc(canvas))

document.querySelector('#group').addEventListener('click', () => groupObjects(canvas, group, true))
document.querySelector('#ungroup').addEventListener('click', () =>  groupObjects(canvas, group, false))

document.querySelector('#restore').addEventListener('click', () =>  restoreCanvas(canvas, svgState, bgImg))

document.getElementById('myImg').addEventListener('change', imgAdded)

document.getElementById('saveCanvas').addEventListener('click', saveCanvas)

