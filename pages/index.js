import Head from 'next/head'
import { useEffect, useState, useContext } from 'react'
import { selectAll, select } from 'd3'
import DropDown
	from '../components/DropDown'

import context from '../components/context'
export default function Home() {
	const [width, setWidth] = useState(-1)
	const [height, setHeight] = useState(-1)
	const [squares, setSquares] = useState([])

	const [start, setStart] = useState(-1)
	const [goal, setGoal] = useState(-1)

	const [isDragging, setDrag] = useState(false)
	const [isBusy, setBusy] = useState(false)
	const [mouseDown, setMouseDown] = useState(false)
	const [isAnimating, setAnimating] = useState(0)
	const [animatingState, setAnimatingState] = useState(0)
	const [path, setPath] = useState([])
	const [exploredPath, setExploredPath] = useState([])
	const [finalCost, setCost] = useState(0)
	const [hueristicMode, setHueristicMode] = useState(0)
	const [isLoaded, setLoaded] = useState(false)
	const [numCols, setNumCols] = useState(0)
	const [numRows, setNumRows] = useState(0)
	const [timer, setTimer] = useState(0)

	const { selected, setSelected } = useContext(context)


	function checkSelected() {
		if(!selected.name)
			return aStarSearch()
		selected.name == 'A* Search' ? aStarSearch() : selected.name == 'Greedy Search' ? greedySearch() : uniformSearch()

	}
	useEffect(() => {
		if (typeof document != 'undefined') {
			const updateSize = () => {
				clearGrid()
				setWidth(window.innerWidth)
				setHeight(window.innerHeight)
				setSquares([])
				setNumRows(Math.floor((window.innerHeight) / 30))
				setNumCols(Math.floor((window.innerWidth) / 30))
				for (let i = 0; i < Math.floor(window.innerWidth * window.innerHeight / (30 * 30)); i++) {
					setSquares((squares) => [...squares, i])
				}
			}
			updateSize()
			window.addEventListener('resize', updateSize)
			setLoaded(true)
			beginSearch()
			return () => window.removeEventListener('resize', updateSize)
		}

		else if (typeof document == 'undefined') {
			setLoaded(false)
		}
	}, [isLoaded])

	useEffect(() => {
		if (path.length != 0) {
			if (isAnimating == 1)
				animatePathExplored()
			if (isAnimating == 2)
				animatePathExplored(1)
		}

	}, [isAnimating, path])

	useEffect(() => {
		if (typeof window !== "undefined") {
			if (isBusy) {
				document.getElementById("cover").classList.add("fixed")
				document.getElementById("cover").classList.remove("hidden")
			}
			else {
				document.getElementById("cover").classList.remove("fixed")
				document.getElementById("cover").classList.add("hidden")
			}

		}
	}, [isBusy])
	function genBasicMaze() {
		selectAll('.subpath').classed('animate-scale', false).classed('subpath', false)
		selectAll('.exploredpath').classed('animate-scale', false).classed('exploredpath', false)
		selectAll('.cell').classed('animate-scale', false).classed('blocker', true)
		let numCells = squares.length
		let init = Math.floor(numCells * Math.random())
		let startCell = document.getElementById(init)
		startCell.classList.remove('blocker')
		startCell.classList.add('animate-scale')

		let visited = [init]
		let path = [init]
		let x = []
		// console.log("start: " + init)

		// select(`#${init}`).classed('animate-scale', true).classed('blocker', false)
		let counter = 0
		let t = setInterval(() => {
			if (visited.length !== numCells) {

				let index = Math.floor(Math.random() * path.length) //path.length - 1
				let curNode = path[index]
				// visited.pop()

				let up = curNode - numCols
				let down = curNode + numCols
				let left = curNode - 1
				let right = curNode + 1
				let upRight = curNode - numCols + 1
				let upLeft = curNode - numCols - 1
				let downRight = curNode + numCols + 1
				let downLeft = curNode + numCols - 1
				let canDiagRight = false
				let canDiagLeft = false

				let neighbors = []
				const getNeighbor1 = (ID, position = '') => {
					let c = document.getElementById(ID)
					if (ID >= 0 && ID < numCells && c.classList.contains('blocker') && !visited.includes(ID)) { //&& !visited.includes(ID)

						if (position.includes('right') && c.getAttribute('x') != 0) {
							canDiagRight = true
							neighbors.push(ID)
						}
						else if (position.includes('left') && c.getAttribute('x') != numCols - 1) {
							canDiagLeft = true
							neighbors.push(ID)

						}
						else if (position == '') {
							neighbors.push(ID)

						}

					}
				}


				getNeighbor1(up)
				getNeighbor1(right, 'right')
				getNeighbor1(down)
				getNeighbor1(left, 'left')

				if (neighbors.length !== 0) {
					let next = neighbors[Math.floor(Math.random() * neighbors.length)]
					let nextCell = document.getElementById(next)
					nextCell.classList.remove('blocker')
					nextCell.classList.add('animate-scale')
					path.push(next)
					visited = visited.concat(neighbors)
					x = x.concat(neighbors)
				}
				else {
					// path.splice(index, 1)
					//Random Backtracking
					// path = [x[index]]

					//Recent Backtracking

					index = Math.floor(Math.random() * x.length)
					// index = x.length -1
					path = [x[index]]

					x.splice(index, 1)

				}

			}
			else {
				clearInterval(t)
			}
		}, 0)
	}

	function genBasicMaze2() {
		clearGrid()
		setBusy(true)
		selectAll('.cell').classed('animate-scale', false).classed('blocker', true)
		let numCells = squares.length
		let init = Math.floor(Math.random() * numCells)
		let startCell = document.getElementById(init)
		startCell.classList.remove('blocker')
		startCell.classList.add('animate-scale')

		let visited = new Set()
		visited.add(init)
		let path = [init]

		let t = setInterval(() => {
			if (visited.size !== numCells) {

				let curNode = path.pop()//path[path.length - 1]
				let curCell = document.getElementById(curNode)
				curCell.classList.remove('blocker')
				curCell.classList.add('animate-scale')

				let up = curNode - numCols
				let down = curNode + numCols
				let left = curNode - 1
				let right = curNode + 1
				let upRight = curNode - numCols + 1
				let upLeft = curNode - numCols - 1
				let downRight = curNode + numCols + 1
				let downLeft = curNode + numCols - 1
				let canDiagRight = false
				let canDiagLeft = false

				let neighbors = []
				const getNeighbor1 = (ID, position = '') => {
					let c = document.getElementById(ID)
					if (ID >= 0 && ID < numCells && c.classList.contains('blocker') && !visited.has(ID)) { //&& !visited.includes(ID)

						if (position.includes('right') && c.getAttribute('x') != 0) {
							canDiagRight = true
							neighbors.push(ID)
						}
						else if (position.includes('left') && c.getAttribute('x') != numCols - 1) {
							canDiagLeft = true
							neighbors.push(ID)

						}
						else if (position == '') {
							neighbors.push(ID)

						}

					}
				}


				getNeighbor1(up)
				getNeighbor1(right, 'right')
				getNeighbor1(down)
				getNeighbor1(left, 'left')

				const shuffleArray = array => {
					for (let i = array.length - 1; i > 0; i--) {
						const j = Math.floor(Math.random() * (i + 1))
						const temp = array[i]
						array[i] = array[j]
						array[j] = temp
					}
				}

				if (neighbors.length !== 0) {
					shuffleArray(neighbors)
					neighbors.forEach(i => {
						path.push(i)
						visited.add(i)

					})


				}
				else {
					if (Math.random() < 0.4) {
						path.push(curNode)
						visited.add(curNode)
					}
					else {
						curCell.classList.add('blocker')
					}

				}

			}
		}, 0.1)

		setBusy(false)

	}

	function greedySearch(e) {
		if (start == -1) return
		let numCells = squares.length
		let visited = []
		let explored = []
		let paths = [
			{
				path: [start],
				cost: getDistCellID(start, goal),
				index: 0,
			},
		]

		if (start != -1 && goal != -1) {
			let found = false
			while (!found && paths.length != 0) {
				let curPath = getMinCost(paths)
				let curNode = curPath.path[curPath.path.length - 1]
				paths.forEach(({ path }) => {
					path.forEach((cell) => {
						explored.push(cell)
					})
				})
				paths = paths.slice(0, curPath.index).concat(paths.slice(curPath.index + 1))
				if (curNode != goal && !visited.includes(curNode)) {
					let up = curNode - numCols
					let down = curNode + numCols
					let left = curNode - 1
					let right = curNode + 1
					let upRight = curNode - numCols + 1
					let upLeft = curNode - numCols - 1
					let downRight = curNode + numCols + 1
					let downLeft = curNode + numCols - 1
					let canDiagRight = false
					let canDiagLeft = false
					const appendPaths = (ID, position = '') => {
						let c = document.getElementById(ID)
						if (ID >= 0 && ID < numCells && !c.classList.contains('blocker') && !visited.includes(ID)) {
							let temp = curPath.path.concat([ID])
							//(h(n) = g(n)
							if (position.includes('right') && c.getAttribute('x') != 0) {
								canDiagRight = true
								paths.push({ path: temp, cost: getDistCellID(ID, goal) })

							}
							else if (position.includes('left') && c.getAttribute('x') != numCols - 1) {
								canDiagLeft = true
								paths.push({ path: temp, cost: getDistCellID(ID, goal) })

							}
							else if (position == '')
								paths.push({ path: temp, cost: getDistCellID(ID, goal) })


						}
					}


					appendPaths(up)
					appendPaths(right, 'right')
					appendPaths(down)
					appendPaths(left, 'left')
					if (hueristicMode == 0) {
						if (canDiagLeft) {
							appendPaths(upLeft)
							appendPaths(downLeft)
						}
						if (canDiagRight) {
							appendPaths(upRight)
							appendPaths(downRight)
						}
					}


					visited.push(curNode)
				}
				else if (visited.includes(curNode) && curNode != goal) {
					continue
				}
				else {
					found = true
					setPath(curPath.path)
					setCost(getCosts(curPath.path))

					setExploredPath(explored)
				}
			}
		}
	}

	function aStarSearch(e) {
		if (start == -1 || goal == -1) return
		let numCells = squares.length
		let visited = []
		let explored = []
		let paths = [
			{
				path: [start],
				cost: getDistCellID(start, goal),
				index: 0,
			},
		]


		let found = false
		while (!found && paths.length != 0) {
			let curPath = getMinCost(paths)
			let curNode = curPath.path[curPath.path.length - 1]
			paths.forEach(({ path }) => {
				path.forEach((cell) => {
					explored.push(cell)
				})
			})
			paths = paths.slice(0, curPath.index).concat(paths.slice(curPath.index + 1))
			if (curNode != goal && !visited.includes(curNode)) {
				let up = curNode - numCols
				let down = curNode + numCols
				let left = curNode - 1
				let right = curNode + 1
				let upRight = curNode - numCols + 1
				let upLeft = curNode - numCols - 1
				let downRight = curNode + numCols + 1
				let downLeft = curNode + numCols - 1
				let canDiagRight = false
				let canDiagLeft = false
				const appendPaths = (ID, position = '') => {
					let c = document.getElementById(ID)
					if (ID >= 0 && ID < numCells && !c.classList.contains('blocker') && !visited.includes(ID)) {
						let temp = curPath.path.concat([ID])
						let cost = getCosts(temp) + getDistCellID(ID, goal)

						//(h(n) = g(n)
						if (position.includes('right') && c.getAttribute('x') != 0) {
							canDiagRight = true
							paths.push({ path: temp, cost: cost })
						}
						else if (position.includes('left') && c.getAttribute('x') != numCols - 1) {
							canDiagLeft = true
							paths.push({ path: temp, cost: cost })
						}
						else if (position == '')
							paths.push({ path: temp, cost: cost })

					}
				}

				appendPaths(up)
				appendPaths(right, 'right')
				appendPaths(down)
				appendPaths(left, 'left')
				if (hueristicMode == 0) {
					if (canDiagLeft) {
						appendPaths(upLeft)
						appendPaths(downLeft)
					}
					if (canDiagRight) {
						appendPaths(upRight)
						appendPaths(downRight)
					}
				}

				visited.push(curNode)
			}
			else if (visited.includes(curNode) && curNode != goal) {
				continue
			}
			else {
				found = true
				setPath(curPath.path)
				setCost(getCosts(curPath.path))
				setExploredPath(explored)
			}
		}

	}

	function getCosts(array) {
		let sum = 0
		array.forEach(i => {
			sum += +document.getElementById(i).getAttribute('cost')
		})

		return sum
	}

	function uniformSearch(e) {
		if (start == -1) return
		let numCells = squares.length
		let visited = []
		let explored = []
		let paths = [
			{
				path: [start],
				cost: 0,
				index: 0,
			},
		]

		if (start != -1 && goal != -1) {
			let found = false
			while (!found && paths.length != 0) {
				let curPath = getMinCost(paths)
				let curNode = curPath.path[curPath.path.length - 1]
				paths.forEach(({ path }) => {
					path.forEach((cell) => {
						explored.push(cell)
					})
				})
				paths = paths.slice(0, curPath.index).concat(paths.slice(curPath.index + 1))
				if (curNode != goal && !visited.includes(curNode)) {
					let up = curNode - numCols
					let down = curNode + numCols
					let left = curNode - 1
					let right = curNode + 1
					let upRight = curNode - numCols + 1
					let upLeft = curNode - numCols - 1
					let downRight = curNode + numCols + 1
					let downLeft = curNode + numCols - 1

					let canDiagRight = false
					let canDiagLeft = false
					const appendPaths = (ID, position = '') => {
						let c = document.getElementById(ID)
						if (ID >= 0 && ID < numCells && !c.classList.contains('blocker') && !visited.includes(ID)) {
							let temp = curPath.path.concat([ID])
							let cost = getCosts(temp)

							//(h(n) = g(n)
							if (position.includes('right') && c.getAttribute('x') != 0) {
								canDiagRight = true
								paths.push({ path: temp, cost: cost })

							}
							else if (position.includes('left') && c.getAttribute('x') != numCols - 1) {
								canDiagLeft = true
								paths.push({ path: temp, cost: cost })

							}
							else if (position == '')
								paths.push({ path: temp, cost: cost })


						}
					}

					appendPaths(up)
					appendPaths(right, 'right')
					appendPaths(down)
					appendPaths(left, 'left')
					if (hueristicMode == 0) {
						if (canDiagLeft) {
							appendPaths(upLeft)
							appendPaths(downLeft)
						}
						if (canDiagRight) {
							appendPaths(upRight)
							appendPaths(downRight)
						}
					}


					visited.push(curNode)
				}
				else if (visited.includes(curNode) && curNode != goal) {
					continue
				}
				else {
					found = true
					setPath(curPath.path)
					setCost(getCosts(curPath.path))
					setExploredPath(explored)
				}
			}
		}
	}

	function depthFirstSearch(e) {
		if (start == -1) return
		let numCells = squares.length
		let visited = []
		let explored = []
		let nodeStack = [start]
		let pathStack = [{
			path: [start]
		}
		]

		let found = false
		while (!found && nodeStack.length != 0) {
			pathStack.forEach(({ path }) => {
				path?.forEach(node => {
					explored.push(node)
				})
			})

			let curPath = pathStack.pop().path
			let curNode = nodeStack.pop()

			if (!visited.includes(curNode)) {
				visited.push(curNode)

				if (curNode == goal) {
					found = true
					setPath(curPath)
					setCost(curPath.length)
					setExploredPath(explored)
				}
				let up = curNode - numCols
				let down = curNode + numCols
				let left = curNode - 1
				let right = curNode + 1
				let upRight = curNode - numCols + 1
				let upLeft = curNode - numCols - 1
				let downRight = curNode + numCols + 1
				let downLeft = curNode + numCols - 1
				let canDiagRight = false
				let canDiagLeft = false

				const appendPaths = (ID, position = '') => {
					let c = document.getElementById(ID)
					if (ID > 0 && ID < numCells && !c.classList.contains('blocker')) { //&& !visited.includes(ID)
						let temp = [...curPath]
						temp.push(ID)

						if (position.includes('right') && c.getAttribute('x') != 0) {
							canDiagRight = true
							pathStack.push({ path: temp })
							nodeStack.push(ID)
						}
						else if (position.includes('left') && c.getAttribute('x') != numCols - 1) {
							canDiagLeft = true
							pathStack.push({ path: temp })
							nodeStack.push(ID)

						}
						else if (position == '') {
							pathStack.push({ path: temp })
							nodeStack.push(ID)
						}

					}
				}
				appendPaths(up)
				appendPaths(right, 'right')
				appendPaths(down)
				appendPaths(left, 'left')
			}
		}
	}

	let counter = animatingState
	function animatePathExplored(animation = 0) {
		let cell = 0
		setBusy(true)
		if (isAnimating == 1 && animation == 0) {

			if (isAnimating == 1 && counter == 0) {
				selectAll('.subpath').classed('subpath', false).classed('animate-scale', false)
				selectAll('.exploredpath').classed('exploredpath', false).classed('animate-scale', false)
			}
			let newExplored = new Set(exploredPath)
			newExplored = [...newExplored]
			const timer1 = setInterval(() => {

				setAnimating(prev => {
					if (prev <= 0) {
						if (prev != -1)
							setAnimatingState(counter)
						clearInterval(timer1)
						return 0
					}

					if (prev == 1) {
						cell = newExplored[counter]
						let element = document.getElementById(cell)

						if (!element.classList.contains('exploredpath')) {
							element.classList.add('animate-scale')
							element.classList.add('exploredpath')

						}
						counter += 1

						if (counter == newExplored.length - 1) {
							setAnimatingState(0)
							selectAll('.exploredpath').classed('animate-scale', false)
							counter = 0
							setAnimating(2)
							animatePathExplored(1)
							return 2
						}

					}

					return prev
				})


			}, 10)
		}
		else if (isAnimating == 2 && animation == 1) {
			const timer2 = setInterval(() => {
				setAnimating(prev => {
					if (prev <= 0) { //pause state
						setAnimatingState(counter)
						clearInterval(timer2)
						return -2
					}

					if (prev == 2) {
						cell = path[counter]
						let element = document.getElementById(cell)

						if (!element.classList.contains('subpath')) {
							element.classList.remove('exploredpath')
							element.classList.add('animate-scale')
							element.classList.add('subpath')

						}
						counter += 1

						if (counter == path.length - 1) {
							setAnimating(0)
							setAnimatingState(0)
							counter = 0
							clearInterval(timer2)
							return 0
						}


					}

					return prev
				})


			}, 80)
		}

		setBusy(false)


	}

	function randomizeGrid(e) {
		e.preventDefault()
		// selectAll('.blocker').classed('animate-scale', false).classed('blocker', false)
		// selectAll('.subpath').classed('animate-scale', false).classed('subpath', false)
		// selectAll('.exploredpath').classed('animate-scale', false).classed('exploredpath', false)
		clearGrid()
		const cells = document.querySelectorAll('[data-cell]')
		cells.forEach((cell) => {
			let rand = Math.floor(Math.random() * 100)
			if ((!cell.classList.contains('start') && !cell.classList.contains('goal') && rand >= 70)) {
				setTimeout(() => {
					cell.classList.add('animate-scale')

				}, 100)
				cell.classList.remove('animate-scale')

				cell.classList.add('blocker')

			}
		})
		if (start !== -1 && goal !== -1)
			return
		if (isAnimating == 1) {
			setAnimating(0)
		}
		else {
			clearPath()
			setAnimating(1)
			checkSelected()
		}

	}

	function randomizeCosts(e) {
		e.preventDefault()
		selectAll('.cell').classed('animate-scale', false).classed('subpath', false).classed('exploredpath', false).classed('grass', false).classed('water', false).classed('hill', false)
		const cells = document.querySelectorAll('[data-cell]')
		cells.forEach((cell) => {
			let cost = Math.random() * 10
			if ((!cell.classList.contains('start') && !cell.classList.contains('goal') && cost > 1)) {

				cell.setAttribute('cost', cost)

				// if (cost == 2) {
				// 	cell.classList.add('grass')

				// }
				// else if (cost == 3) {
				// 	cell.classList.add('water')

				// }
				// else {
				// 	cell.classList.add('hill')
				// }

			}
		})
		if (isAnimating == 1) {
			setAnimating(0)
		}
		else {
			if (goal != -1) {
				clearPath()
				setAnimating(1)
				checkSelected()
			}
		}

	}

	function getMinCost(paths) {
		let minPath = paths[0].path
		let minCost = paths[0].cost
		let index = 0
		let count = 0

		paths.forEach((subPath) => {
			if (subPath.cost < minCost) {
				minCost = subPath.cost
				minPath = subPath.path
				index = count
			}
			count++
		})

		return {
			path: minPath,
			cost: minCost,
			index: index,
		}
	}

	function getDistCellID(cell1, cell2) {
		let pos1 = {
			x: document.getElementById(cell1).getAttribute('x'),
			y: document.getElementById(cell1).getAttribute('y'),
		}

		let pos2 = {
			x: document.getElementById(cell2).getAttribute('x'),
			y: document.getElementById(cell2).getAttribute('y'),
		}

		if (hueristicMode == 0) {
			return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2))
		}
		else {
			return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y)
		}
	}

	function handleCellClick(e) {
		e.preventDefault()
		console.log("lol")
		const cell = e.target
		if (!cell.classList.contains('start') && !cell.classList.contains('goal') && start == -1) {
			cell.classList.add('start')
			setStart(+cell.getAttribute('id'))
		}
		else if (!cell.classList.contains('goal') && !cell.classList.contains('start') && goal == -1) {
			cell.classList.add('goal')
			setGoal(+cell.getAttribute('id'))
		}
		else if (cell.classList.contains('blocker')) {
			cell.classList.remove('animate-scale')
			cell.classList.remove('blocker')
			cell.classList.remove('subpath')
		}
		else if (!cell.classList.contains('blocker') && !cell.classList.contains('start') && !cell.classList.contains('goal')) {
			setTimeout(() => {
				cell.classList.add('animate-scale')
			}, 100)
			cell.classList.remove('animate-scale')

			cell.classList.add('blocker')
			cell.classList.remove('subpath')
			cell.classList.remove('exploredpath')
		}
	}

	function handleCellDrag(e) {
		e.preventDefault()
		const cell = e.target
		if (!mouseDown || cell.classList.contains('goal') || cell.classList.contains('start'))
			return

		// if (buildMode) {

		// 	if (!cell.classList.contains('goal') && !cell.classList.contains('start') && !cell.classList.contains('blocker')) {
		// 		cell.classList.remove('subpath')
		// 		cell.classList.remove('exploredpath')
		// 		cell.classList.add('blocker')
		// 	}
		// 	else {
		// 		cell.classList.remove('blocker')
		// 	}
		// }
		// else {
		if (!cell.classList.contains('blocker')) {
			setTimeout(() => {
				cell.classList.add('animate-scale')
			}, 100)
			cell.classList.remove('animate-scale')
			cell.classList.remove('subpath')
			cell.classList.remove('exploredpath')
			cell.classList.add('blocker')
		}
		else {
			cell.classList.remove('blocker')
		}
		// }
	}

	function GenerateGrid() {
		let yIndex = 0
		// const gridContainer = document.getElementById('grid-container')
		document.documentElement.style.setProperty('--num-cols', numCols)

		return squares.map((square, index) => {
			index % numCols == 0 ? yIndex++ : yIndex
			const pos = {
				x: index % numCols,
				y: yIndex,
			}

			return (
				<div
					key={index}
					id={index}
					x={pos.x}
					y={pos.y - 1}
					cost={1}
					className={'cell'}
					data-cell
					onMouseEnter={handleCellDrag}
					onMouseDown={handleCellClick}
				>
				</div>
			)
		})
	}

	function clearGrid() {
		const cells = document.querySelectorAll('[data-cell]')
		cells.forEach((cell) => {
			cell.classList.remove('goal')
			cell.classList.remove('start')
			cell.setAttribute('cost', 1)
		})
		setStart(-1)
		setGoal(-1)
		setPath([])
		setExploredPath([])
		selectAll('.cell').classed('animate-scale', false).classed('subpath', false).classed('blocker', false).classed('exploredpath', false).classed('grass', false).classed('water', false).classed('hill', false)
		setAnimating(0)
		setAnimatingState(0)
	}

	function clearWalls(e) {
		e.preventDefault()
		let blockers = selectAll('.blocker')
		if (blockers.node()) {
			blockers.classed('blocker', false).classed('animate-scale', false)
			if (isAnimating != 1) {
				checkSelected()
				setAnimating(1)
			}

		}

	}

	function clearPath(e = false) {
		e ? e.preventDefault() : e

		//select('.goal').classed('goal', false).classed('animate-scale', false)
		//select('.start').classed('start', false).classed('animate-scale', false)

		// setStart(-1)
		// setGoal(-1)
		setPath([])
		setAnimating(0)
		setAnimatingState(0)
		setExploredPath([])
		selectAll('.subpath').classed('subpath', false).classed('animate-scale', false)
		selectAll('.exploredpath').classed('exploredpath', false).classed('animate-scale', false)
		// selectAll('.blocker').classed('blocker', false).classed('animate-scale', false)

	}

	function toggleHueristic(e) {
		e.preventDefault()
		hueristicMode == 0 ? setHueristicMode(1) : setHueristicMode(0)
		// aStarSearch(e)
	}

	function beginSearch(e) {
		e ? e.preventDefault() : null

		if (isAnimating <= 0 && isAnimating > -2) {
			let startTime = performance.now()
			checkSelected()
			let endTime = performance.now()
			let elapsedTime = endTime - startTime
			setTimer(Math.floor(elapsedTime * 1000) / 1000)
			setAnimating(1)
		}
		else if (isAnimating == -2) {
			setAnimating(2)

		}
		else if (isAnimating == 1 || isAnimating == -1) {
			setAnimating(0)
		}
		else if (isAnimating == 2) {
			setAnimating(-2)
		}

	}

	return (
		<div className='flex w-screen h-screen overflow-hidden' >
			<div id="cover" className='w-full h-full bg-black pointer-events-none z-50 fixed'>sdfsdfsdfsddddddddddddddddddddddd</div>
			<Head>
				<title>Search Algorithm Visualizer</title>
			</Head>
			<nav>
				<ul id='navbar' className={`${mouseDown ? 'pointer-events-none' : 'pointer-events-auto'} shadow-sm hover:bg-opacity-90 shadow-black flex flex-col z-10 right-11 top-11 p-6 fixed bg-opacity-50 rounded-lg  transition-all ease-in-out justify-items-start items-center gap-4 bg-blue-900 w-[10%] h-auto overflow-hidden`}>
					<DropDown></DropDown>

					<li className='hover:block relative'>
						<button className='h-[50%]  ml-3 pl-2 pr-2 text-white hover:underline' onClick={beginSearch}>
							{isAnimating <= 0 ? 'Start Search' : 'Pause Search'}
						</button>
					</li>
					<button className='h-[50%] ml-3 pl-2 pr-2 text-white hover:underline' onClick={() => clearGrid()}>
						Reset
					</button>
					<button className='h-[50%]  ml-3 pl-2 pr-2 text-white hover:underline' onClick={clearWalls}>
						Clear Walls
					</button>
					<button className='h-[50%]  ml-3 pl-2 pr-2 text-white hover:underline' onClick={clearPath}>
						Clear Path
					</button>
					<button className=' ml-3 pl-2 pr-2 text-white hover:underline' onClick={genBasicMaze2}>
						Generate Maze
					</button>
					<button className='h-[50%]  ml-3 pl-2 pr-2 text-white hover:underline' onClick={randomizeGrid}>
						Randomize Walls
					</button>
					<button className='h-[50%]  ml-3 pl-2 pr-2 text-white hover:underline' onClick={randomizeCosts}>
						Randomize Costs
					</button>
					<button className=' ml-3 pl-2 pr-2 text-white hover:underline' onClick={toggleHueristic}>
						{hueristicMode == 0 ? 'Euclidean' : 'Manhattan'}
					</button>

				</ul>
			</nav>
			<div id="counter" className='shadow-sm text-white shadow-black flex flex-col pointer-events-none z-10 left-11 bottom-5 p-3 fixed bg-opacity-90 rounded-lg transition-all ease-in-out gap-2 bg-blue-900 w-auto h-auto '>
				<h1 className='self-start text-white'>Time: {timer} ms</h1>
				<h1 className='self-start  text-white'>Cost: {finalCost}</h1>
			</div>
			<div
				className='board flex w-screen h-screen flex-wrap -mx-2'
				onMouseDown={() => setMouseDown(true)}
				onMouseUp={() => setMouseDown(false)}
				id='grid-container'
			>
				{isLoaded && GenerateGrid()}
			</div>

		</div>
	)
}
