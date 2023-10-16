'use client'

import { useEffect, useRef, useState } from 'react'
import './chess.scss'
export default function Home() {
  const sg = 64 // 64
  const sb = sg / 16 // 4
  const ssb = sb / 2 // 2
  const sqs = [] as any
  const mks = [
    [2, 1], [2, 7],
    [3, 0], [3, 2], [3, 4], [3, 6], [3, 8],
    [6, 0], [6, 2], [6, 4], [6, 6], [6, 8],
    [7, 1], [7, 7]
  ]
  const chsArr = [
    [1, '車', 0, 0], [1, '車', 0, 8],
    [1, '马', 0, 1], [1, '马', 0, 7],
    [1, '相', 0, 2], [1, '相', 0, 6],
    [1, '仕', 0, 3], [1, '仕', 0, 5],
    [1, '帅', 0, 4],
    [1, '砲', 2, 1], [1, '砲', 2, 7],
    [1, '兵', 3, 0], [1, '兵', 3, 2], [1, '兵', 3, 4], [1, '兵', 3, 6], [1, '兵', 3, 8],
    [-1, '車', 9, 0], [-1, '車', 9, 8],
    [-1, '马', 9, 1], [-1, '马', 9, 7],
    [-1, '象', 9, 2], [-1, '象', 9, 6],
    [-1, '士', 9, 3], [-1, '士', 9, 5],
    [-1, '将', 9, 4],
    [-1, '炮', 7, 1], [-1, '炮', 7, 7],
    [-1, '卒', 6, 0], [-1, '卒', 6, 2], [-1, '卒', 6, 4], [-1, '卒', 6, 6], [-1, '卒', 6, 8]
  ] as any

   /// 玩家走棋
  let side = 1
  const done = [-1, -1]
  const pick = [-1, -1]
  const abs = Math.abs
  const round = Math.round

  const bg = useRef<HTMLDivElement>(null);
  const chess = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if(!bg.current || !chess.current) return

    function placeChess(side: number, name: string, y: number, x: number, i: string){
      if(!chess.current) return
      if(chess.current.children.length > 32) return
      const ch = document.createElement('span') as HTMLSpanElement
      ch.textContent = name
      ch.classList.add('ch', side > 0 ? 'red': 'green')
      ch.setAttribute('i', i)
      ch.style.top = en(y) + 'px'
      ch.style.left = en(x) + 'px'
      chess.current.appendChild(ch)
    }

    function drawChessBoard() {
      if(!bg.current) return
      let rows = document.querySelectorAll('.row')
      if(rows && rows.length > 0) return;
      for (let y = 0; y < 9; y++) {
        const row = document.createElement('div')
        row.classList.add('row')
        sqs[y] = row
        for (let x = 0; x < 8; x++) {
          const sq = document.createElement('div') as HTMLDivElement
          sq.classList.add('sq')
          sqs[y][x] = sq
          row.appendChild(sq)
        }
        bg.current.appendChild(row)
      }
      rows = document.querySelectorAll('.row')
      rows[4].classList.add('middle')
      sqs[1][4].classList.add('cross')
      sqs[8][4].classList.add('cross')
    }

    function drawPosition() {
      if(!bg.current) return;
      for (let i = 0; i < mks.length; i++) {
        const mk = document.createElement('div')
        mk.classList.add('mk')
        mk.style.top = (mks[i][0] * sg + ssb) + 'px'
        mk.style.left = (mks[i][1] * sg + ssb) + 'px'
        bg.current.appendChild(mk)
      }
    }

    const chss = chess.current.querySelectorAll('.ch') as any
    
    drawChessBoard()
    drawPosition();
    for (let i = 0; i < chsArr.length; i++) {
      placeChess.apply(null, chsArr[i].concat(i))
    }

    nextTurn()


    document.addEventListener('mousedown', function(e: any){
      handleAction(e, chss)
    })   
  }, [])




  function  handleAction (e: any, chss: any){
    e = e.originalEvent || e
    if(!side || !chss || chss.length === 0 || !pick || !bg.current) return
    if (e.target.classList.contains('ch') &&
        e.target.classList.contains(side > 0 ? 'red' : 'green')) {
      if (pick[side] >= 0) {
        chss[pick[side]].classList.remove('active')
      }
      e.target.classList.add('active')
      pick[side] = +e.target.getAttribute('i')
      return
    }

    if (pick[side] >= 0) {
      let x = de(e.pageX - bg.current.offsetLeft)
      let y = de(e.pageY - bg.current.offsetTop)
      if (!(x >= -0.4 && x <= 8.4 &&
            y >= -0.4 && y <= 9.4)) return
      if (abs(round(x) - x) > 0.4 ||
          abs(round(y) - y) > 0.4) return
      x = round(x)
      y = round(y)
      const c = chsArr[pick[side]]
      if (!canGo(c, x, y)) return
      chsArr.forEach(function(c: any, i: any){
        if (!c.dead && c[2] === y && c[3] === x) {
          c.dead = true
          chss[i].style.display = 'none'
        }
      })
      const ch = chss[pick[side]]
      ch.style.left = en(x) + 'px'
      ch.style.top = en(y) + 'px'
      c[2] = y
      c[3] = x
      if (c[1] === '兵' || c[1] === '卒') {
        if (side > 0 ? (c[2] >= 5) : (c[2] <= 4)) c.cross = true
      }
      done[side] = pick[side]
      if (done[-side] >= 0) {
        chss[done[-side]].classList.remove('active')
      }
      pick[side] = -1
      nextTurn()
      return
    }
  }

  function en(n: number){
    return n * sg + ssb
  }
  function de(v: number){
    return (v - ssb) / sg
  }
   
  function canGo(c: any, x: any, y:any){
    let dx = x - c[3]
    let dy = y - c[2]
    if (c[1] === '兵' || c[1] === '卒') {
      if (c.cross && dy === 0 && abs(dx) === 1) return true
      return dx === 0 && dy === c[0]
    }
    if (c[1] === '帅' || c[1] === '将') {
      if (!(
        c[0] > 0 ? (x >= 3 && x <= 5 && y >= 0 && y <= 2) :
        (x >= 3 && x <= 5 && y >= 7 && y <= 9)
      )) return false
      return abs(dx) + abs(dy) === 1
    }
    if (c[1] === '仕' || c[1] === '士') {
      if (!(
        c[0] > 0 ? (x >= 3 && x <= 5 && y >= 0 && y <= 2) :
        (x >= 3 && x <= 5 && y >= 7 && y <= 9)
      )) return false
      return abs(dx) * abs(dy) === 1
    }
    if (c[1] === '相' || c[1] === '象') {
      if (!(
        c[0] > 0 ? (x >= 0 && x <= 8 && y >= 0 && y <= 4) :
        (x >= 0 && x <= 8 && y >= 5 && y <= 9)
      )) return false
      if (chsArr.some(function(c1: any){
        return !c1.dead &&
          c1[2] - c[2] === dy / 2 &&
          c1[3] - c[3] === dx / 2
      })) return false
      return abs(dx) === 2 && abs(dy) === 2
    }
    if (c[1] === '马') {
      if (chsArr.some(function(c1: any){
        return !c1.dead &&
          c1[2] - c[2] === sign(dy) * (abs(dy)-1) &&
          c1[3] - c[3] === sign(dx) * (abs(dx)-1)
      })) return false
      return abs(dx) * abs(dy) === 2
    }
    if (c[1] === '車') {
      if (dx * dy !== 0) return false
      const n = chsArr.reduce(function(m: any, c1: any){
        const dx1 = (c1[3] - c[3]) / sign(dx)
        const dy1 = (c1[2] - c[2]) / sign(dy)
        const f = c1 !== c && !c1.dead && (
          (dy && c1[3] === c[3] && dy1 < abs(dy) && dy1 > 0) ||
          (dx && c1[2] === c[2] && dx1 < abs(dx) && dx1 > 0)
        )
        return f ? m+1 : m
      }, 0)
      return n === 0
    }
    if (c[1] === '砲' || c[1] === '炮') {
      if (dx * dy !== 0) return false
      const n = chsArr.reduce(function(m: any, c1: any){
        const dx1 = (c1[3] - c[3]) / sign(dx)
        const dy1 = (c1[2] - c[2]) / sign(dy)
        const f = c1 !== c && !c1.dead && (
          (dy && c1[3] === c[3] && dy1 < abs(dy) && dy1 > 0) ||
          (dx && c1[2] === c[2] && dx1 < abs(dx) && dx1 > 0)
        )
        return f ? m+1 : m
      }, 0)
      if (chsArr.some(function(c1: any){
        return !c1.dead && c1[2] === y && c1[3] === x
      })) {
        return n === 1
      }
      return n === 0
    }
  }
  function sign(v: any){
    return v > 0 ? 1 :
    v < 0 ? -1 : 0
  }
  function nextTurn(){
    if (side == null) side = 1
    else side = -side
    if (side > 0) {
      // todo: AI
      // setTimeout(function(){
      //   nextTurn()
      // }, 2000)
    } else {
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="cont-wrap">
        <div className="cont">
          <div className="chs" ref={chess!}></div>
          <div className="bg" ref={bg!}></div>
        </div>
      </div>
    </main>
  )
}
