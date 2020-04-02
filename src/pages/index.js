import React, { useRef, useEffect, useState } from 'react'
import { withTheme } from 'emotion-theming'
import {
  Box,
  Flex,
  ButtonGroup,
  Button,
  Stack
} from '@chakra-ui/core'
import * as d3 from 'd3'
import { Formik, Form, Field, FieldArray, FastField } from 'formik'
import { useSpring, animated } from 'react-spring'

const Snap = ({ currentTime = 0, points = [], file, top = 0, left = 0 }) => {
  const videoRef = useRef()

  console.log('Snap', top, left)

  useEffect(() => {
    console.log('currentTime', currentTime)
    videoRef.current.currentTime = currentTime
  }, [currentTime])

  useEffect(() => {
    videoRef.current.load()
  }, [file])

  return (
    <>
      <Box
        as='video'
        ref={videoRef}
        w='100%'
        // controls
        pos='absolute'
        top={top}
        left={left}
        zIndex={1001}
        style={{
          clipPath: `url(#svg-clip-path-${currentTime})`
        }}
        onLoad={() => {
          console.log('onloaded!!!!')
        }}
      >
        <source src={file ? URL.createObjectURL(file) : 'https://www.w3schools.com/html/mov_bbb.mp4'} type='video/mp4' />
      </Box>
      <Box
        as='svg'
        pos='absolute'
        top={0}
        left={0}
        w='100%'
        h='100%'
      >
        <defs>
          <clipPath id={`svg-clip-path-${currentTime}`} clipPathUnits='objectBoundingBox'>
            <Box as='polygon' points={points} style={{ fill: 'rgb(0,0,0)' }} />
          </clipPath>
        </defs>
      </Box>
    </>
  )
}
const AnimatedSnap = animated(Snap)

const Snapshot = ({ value, file }) => {
  const [isEnd, setIsEnd] = useState(false)

  let durationSecond = 8
  const currentTime = value.currentTime
  if (currentTime < durationSecond) {
    durationSecond = currentTime
  }

  const props = useSpring({
    from: {
      top: -1000,
      left: 0
    },
    to: {
      top: 0,
      left: 0
    },
    config: {
      duration: durationSecond * 1000
    },
    delay: currentTime - durationSecond > 0
      ? parseInt((currentTime - durationSecond) * 1000, 10)
      : 0,
    onRest: () => {
      setIsEnd(true)
    }
  })

  if (isEnd) return null

  return <AnimatedSnap currentTime={currentTime} points={value.points} top={props.top} left={props.left} file={file} />
}

var points = []

let timer
const timerCallback = (canvas, video) => {
  canvas.width = video.clientWidth
  canvas.height = video.clientHeight

  const ctx = canvas.getContext('2d')
  ctx.drawImage(video, 0, 0, video.clientWidth, video.clientHeight)
  clearTimeout(timer)
  timer = setTimeout(() => {
    timerCallback(canvas, video)
  }, 0)
}

const Index = () => {
  const canvasRef = useRef()
  const videoRef = useRef()
  const [isRunning, setIsRunning] = useState(false)
  const [file, setFile] = useState(null)

  useEffect(() => {
    console.log('videoRef.current.clientWidth', videoRef.current.clientWidth)
    console.log('videoRef.current.clientHeight', videoRef.current.clientHeight)
    console.log('videoRef.current.offsetWidth', videoRef.current.offsetWidth)
    console.log('videoRef.current.offsetHeight', videoRef.current.offsetHeight)
    console.log('videoRef.current.videoWidth', videoRef.current.videoWidth)
    console.log('videoRef.current.videoHeight', videoRef.current.videoHeight)

    // canvasRef.current.width = videoRef.current.clientWidth
    // canvasRef.current.height = videoRef.current.clientHeight
    timerCallback(canvasRef.current, videoRef.current)

    var drawing = false
    var startPoint
    var g
    const svg = d3.select('.main-svg')
    // 滑鼠離開時的情況
    // 1. 畫圖的第一圓點
    // 2. 畫圖的其他圓點
    // 3. 按其他圓點
    svg.on('mouseup', function () {
      // drawing 代表 mouse move 時有變化
      drawing = true
      // 用 start point 記錄當前的座標
      startPoint = [d3.mouse(this)[0], d3.mouse(this)[1]]
      // 未變成 polygon 之前，未填色之前，路徑都存在 class 為 drawPoly 的 g 裡
      // 所以未有 drawPoly 時，即畫圖的第一圓點時，就新建一個。
      if (svg.select('g.drawPoly').empty()) {
        // 清空 point
        points.splice(0)

        svg.selectAll('*').remove()
        g = svg.append('g')
          .attr('class', 'drawPoly')
      }
      // 如果是按了其他圓點, 就 close polygon 和填色, 和離開
      if (d3.event.target.hasAttribute('is-handle')) {
        closePolygon()
        return
      }
      // 將 x, y 坐標放到 points
      points.push([d3.mouse(this)[0].toFixed(2), d3.mouse(this)[1].toFixed(2)])
      // g 裡移除所有 polyline, circle
      g.selectAll('*').remove()
      // console.log(g.select('circle'))
      // g.select('circle').remove()
      // g 裡根據 points 重新畫 polyline
      g.append('polyline').attr('points', points)
        .style('fill', 'none')
        .attr('stroke', '#000')
      // 加上圓點
      for (var i = 0; i < points.length; i++) {
        console.log('add circle !!!!')
        g.append('circle')
          .attr('cx', points[i][0])
          .attr('cy', points[i][1])
          .attr('r', 4)
          .attr('fill', 'yellow')
          .attr('stroke', '#000')
          .attr('is-handle', 'true')
      }
    })
    // close polygon 時
    function closePolygon () {
      // 刪除之前的線和圓點
      svg.select('g.drawPoly').remove()
      // 弄一個新的 g
      var g = svg.append('g')
      // 加入 polygon
      g.append('polygon')
        .attr('points', points)
        .style('fill', 'rgb(0,0,0,0.5)')
      // 加入圓點
      for (var i = 0; i < points.length; i++) {
        g.selectAll('circles')
          .data([points[i]])
          .enter()
          .append('circle')
          .attr('cx', points[i][0])
          .attr('cy', points[i][1])
          .attr('r', 4)
          .attr('fill', '#FDBC07')
          .attr('stroke', '#000')
          .attr('is-handle', 'true')
          .style({ cursor: 'move' })
      }
      // drawing = false 代表 mouse move 時無變化
      drawing = false
    }
    svg.on('mousemove', function () {
      if (!drawing) return
      // 由 drawPoly 出發
      var g = d3.select('g.drawPoly')
      // remove line
      g.select('line').remove()
      // add line, 綠色線
      g.append('line')
        .attr('x1', startPoint[0])
        .attr('y1', startPoint[1])
        .attr('x2', d3.mouse(this)[0] + 2)
        .attr('y2', d3.mouse(this)[1])
        .attr('stroke', '#53DBF3')
        .attr('stroke-width', 1)
    })

    return () => {
      clearTimeout(timer)
    }
  }, [])

  const handleFileChange = (e) => {
    const input = e.target
    if ('files' in input && input.files.length > 0) {
      const file = input.files[0]
      console.log('file', URL.createObjectURL(file))
      setFile(file)
    }
  }

  useEffect(() => {
    videoRef.current.load()
  }, [file])

  return (
    <Box>
      <Formik
        initialValues={{ snapshots: {} }}
        onSubmit={(values, { setSubmitting }) => {
          console.log(values)
        }}
      >
        {({ isSubmitting, setFieldValue, values }) => (
          <Form>
            <Flex justify='space-between' m={4}>
              <Box>
                <Stack isInline spacing={4}>
                  <Box>
                    <label htmlFor='file-upload' className='custom-file-upload'>
                      Open
                    </label>
                    <input id='file-upload' name='file' type='file' accept='video/mp4,video/x-m4v,video/*' onChange={handleFileChange} />
                  </Box>
                  <Button
                    variantColor='teal'
                    variant='outline'
                    onClick={() => {
                      videoRef.current.currentTime = 0
                      videoRef.current.play()
                      setIsRunning(true)
                    }}
                  >
                    Run
                  </Button>
                </Stack>
              </Box>
              <Box>
                <ButtonGroup spacing={4}>
                  <Button
                    variantColor='teal'
                    variant='outline'
                    onClick={() => {
                      const currentTime = videoRef.current.currentTime
                      console.log('currentTime', currentTime)
                      setFieldValue('snapshots', {
                        ...values.snapshots,
                        [parseInt((currentTime.toFixed(2) * 100), 10)]: {
                          currentTime,
                          points: points.map(p => [p[0] / 1920, p[1] / 1080])
                        }
                      })
                    }}
                  >
                    Add
                  </Button>
                  <Button variantColor='teal' variant='outline'>
                    Reset
                  </Button>
                </ButtonGroup>
              </Box>
            </Flex>
            <Flex>
              <Box w='50%'>
                <Box
                  as='video'
                  ref={videoRef}
                  w='100%'
                  controls
                  pos={isRunning ? 'absolute' : 'relative'}
                  top={0}
                  zIndex={1000}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    videoRef.current.pause()
                    setIsRunning(false)
                  }}
                >
                  <source src={file ? URL.createObjectURL(file) : 'https://www.w3schools.com/html/mov_bbb.mp4'} type='video/mp4' />
                </Box>
                {isRunning && Object.keys(values.snapshots).sort().map(key => {
                  return (
                    <Snapshot key={key} value={values.snapshots[key]} file={file} />
                  )
                })}
              </Box>
              <Box pos='relative' w='50%'>
                <Box as='canvas' ref={canvasRef} w='100%' />
                <Box as='svg' className='main-svg' pos='absolute' top={0} w='100%' h='100%' viewBox='0 0 1920 1080' preserveAspectRatio='none' />
              </Box>
            </Flex>
            <Box>
              {Object.keys(values.snapshots).sort().map(key => {
                return (
                  <FastField key={key} name={`snapshots.${key}`}>
                    {({ field, form, meta }) => {
                      return (
                        <Box m={4}>
                          {JSON.stringify(field.value)}
                        </Box>
                      )
                    }}
                  </FastField>
                )
              })}
            </Box>
          </Form>
        )}
      </Formik>
      <style jsx>{`
        .main-svg {
          border: 1px solid;
        }
        path {
          fill: lightsalmon;
          stroke: salmon;    
          stroke-width: 5px;
        }
        input[type="file"] {
          display: none;
        }
        .custom-file-upload {
          border: 1px solid currentColor;
          color: #81E6D9;
          display: inline-flex;
          cursor: pointer;
          border-radius: 0.25rem;
          height: 2.5rem;
          min-width: 2.5rem;
          font-size: 1rem;
          padding-left: 1rem;
          padding-right: 1rem;
          vertical-align: middle;
          line-height: 1.2;
          font-weight: 600;
          align-items: center;
          justify-content: center;
        }
        .custom-file-upload.disabled {
          opacity: 0.4;
          cursor: not-allowed;
          box-shadow: none;
        }
      `}
      </style>
    </Box>
  )
}

export default withTheme(Index)
