import React, { useRef, useEffect } from 'react'
import { withTheme } from 'emotion-theming'
import {
  Box,
  Flex
} from '@chakra-ui/core'
import * as d3 from 'd3'

let timer
const timerCallback = (canvas, video, width, height) => {
  const ctx = canvas.getContext('2d')
  ctx.drawImage(video, 0, 0, width, height)
  clearTimeout(timer)
  timer = setTimeout(() => {
    timerCallback(canvas, video, width, height)
  }, 0)
}

const Index = () => {
  const canvasRef = useRef()
  const videoRef = useRef()

  const handleTimeUpdate = (e) => {
    console.log(e.target.currentTime)
  }

  useEffect(() => {
    canvasRef.current.width = videoRef.current.clientWidth
    canvasRef.current.height = videoRef.current.clientHeight
    timerCallback(canvasRef.current, videoRef.current, canvasRef.current.width, canvasRef.current.height)

    var drawing = false
    var startPoint
    var points = []
    var g
    const svg = d3.select('svg')
    svg.on('mouseup', function () {
      drawing = true
      startPoint = [d3.mouse(this)[0], d3.mouse(this)[1]]
      if (svg.select('g.drawPoly').empty()) g = svg.append('g').attr('class', 'drawPoly')
      if (d3.event.target.hasAttribute('is-handle')) {
        closePolygon()
        return
      };
      points.push(d3.mouse(this))
      g.select('polyline').remove()
      g.append('polyline').attr('points', points)
        .style('fill', 'none')
        .attr('stroke', '#000')
      for (var i = 0; i < points.length; i++) {
        g.append('circle')
          .attr('cx', points[i][0])
          .attr('cy', points[i][1])
          .attr('r', 4)
          .attr('fill', 'yellow')
          .attr('stroke', '#000')
          .attr('is-handle', 'true')
          .style({ cursor: 'pointer' })
      }
    })
    function closePolygon () {
      svg.select('g.drawPoly').remove()
      var g = svg.append('g')
      g.append('polygon')
        .attr('points', points)
        .style('fill', 'rgb(0,0,0,0.5)')
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
      points.splice(0)
      drawing = false
    }
    svg.on('mousemove', function () {
      if (!drawing) return
      var g = d3.select('g.drawPoly')
      g.select('line').remove()
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

  return (
    <Box>
      <Flex>
        <Box as='video' ref={videoRef} w='50%' controls onTimeUpdate={handleTimeUpdate}>
          <source src='https://www.w3schools.com/html/mov_bbb.mp4' type='video/mp4' />
        </Box>
        <Box pos='relative' w='50%'>
          <Box as='canvas' ref={canvasRef} w='100%' />
          <Box as='svg' pos='absolute' top={0} left={0} w='100%' h='100%' />
        </Box>
      </Flex>
      <style jsx>{`
        :global(svg) {
          border: 1px solid;
        }
        :global(path) {
          fill: lightsalmon;
          stroke: salmon;    
          stroke-width: 5px;
        }
      `}
      </style>
    </Box>
  )
}

export default withTheme(Index)
