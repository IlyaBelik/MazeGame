const {Engine, Render, Runner, World, Bodies, Body, Events} = Matter

const width = window.innerWidth
const height = window.innerHeight
const cellsHorizontal = 4
const cellsVertical = 3

const unitLengthX = width / cellsHorizontal
const unitLengthY = height / cellsVertical

const engine = Engine.create()
engine.world.gravity.y = 0
const {world} = engine
const render = Render.create({
    element: document.body,
    engine,
    options: {
        wireframes: false,
        width,
        height,
    }
})

Render.run(render)
Runner.run(Runner.create(), engine)

const horizontalWall = width / 2
const sideWall = height / 2
const wallSize = 1

// Walls
const walls = [
    Bodies.rectangle(horizontalWall, 0, width, wallSize, {
        isStatic: true
    }),
    Bodies.rectangle(horizontalWall, height, width, wallSize, {
        isStatic: true
    }),
    Bodies.rectangle(0, sideWall, wallSize, height, {
        isStatic: true
    }),
    Bodies.rectangle(width, sideWall, wallSize, height, {
        isStatic: true
    })
]
World.add(world, walls)

// maze generation

const shuffle = (arr) => {
    let counter = arr.length
    while (counter > 0){
        const index = Math.floor(Math.random() * counter)

        counter--

        const temp = arr[counter]
        arr[counter] = arr[index]
        arr[index] = temp
    }

    return arr
}

const grid = Array(cellsVertical)
    .fill(null)
    .map(() => Array(cellsHorizontal)
        .fill(false))

const verticals = Array(cellsVertical)
    .fill(null)
    .map(() => Array(cellsHorizontal - 1)
        .fill(false))

const horizontals = Array(cellsVertical - 1 )
    .fill(null)
    .map(() => Array(cellsHorizontal)
        .fill(false))

// starting points

const startRow = Math.floor(Math.random() * cellsVertical)
const startColumn = Math.floor(Math.random() * cellsHorizontal)

const stepThroughStep = (row, column) => {
    // if cell is visited just return
    if(grid[row][column]){
        return
    }
    // mark this cell as being visited
    grid[row][column] = true
    // assemble randomly-ordered list of neighbours
    const neighbours = shuffle([
        [row - 1, column, 'up'],
        [row, column + 1, 'right'],
        [row + 1, column, 'down'],
        [row, column - 1, 'left']
    ])

    // for each neighbour
    for(let neighbour of neighbours){
        const [nextRow, nextColumn, direction] = neighbour
        // see if neighbour is out of bound
        if(nextRow < 0 || nextRow >= cellsVertical || nextColumn < 0 || nextColumn >= cellsHorizontal){
            continue
        }

        // if visited neighbour, continue to next neighbour
        if(grid[nextRow][nextColumn]){
            continue
        }
        // remove a wall from either horizontals and verticals
        if(direction === 'left'){
            verticals[row][column - 1] = true
        }else if(direction === 'right'){
            verticals[row][column] = true
        }else if(direction === 'up'){
            horizontals[row - 1][column] = true
        }else if(direction === 'down'){
            horizontals[row][column] = true
        }

        stepThroughStep(nextRow, nextColumn)
    }


    // visit that next cell
}

stepThroughStep(startRow, startColumn)

horizontals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if(open){
            return
        }

        const horizontalWall = Bodies.rectangle(
            columnIndex * unitLengthX + unitLengthX / 2,
            rowIndex * unitLengthY + unitLengthY,
            unitLengthX,
            10,
            {
                isStatic: true,
                label: 'wall',
                render: {
                    fillStyle: 'orange'
                }
            }
        )
        World.add(world, horizontalWall)
    })
})

verticals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if(open){
            return
        }

        const verticalWall = Bodies.rectangle(
            columnIndex * unitLengthX + unitLengthX,
            rowIndex * unitLengthY + unitLengthY / 2,
            10,
            unitLengthY,
            {
                isStatic: true,
                label: 'wall',
                render: {
                    fillStyle: 'orange'
                }
            }
        )
        World.add(world, verticalWall)
    })
})

// goal

const goal = Bodies.rectangle(
    width - unitLengthX / 2,
    height - unitLengthY / 2,
    unitLengthX * .7,
    unitLengthY * .7,
    {
        isStatic: true,
        label: 'goal',
        render: {
            fillStyle: 'green'
        }
    }
)
World.add(world, goal)

// ball

const ballRadius = Math.min(unitLengthX, unitLengthY) / 4

const ball = Bodies.circle(
    unitLengthX / 2,
     unitLengthY / 2,
    ballRadius,
    {
        label: 'ball',
        render: {
            fillStyle: 'aqua'
        }
    }
)
World.add(world, ball)

document.addEventListener('keydown', event => {
    const {x,y} = ball.velocity
    if(event.keyCode === 87){
        Body.setVelocity(ball, {x, y: y - 5})
    }else if(event.keyCode === 68){
        Body.setVelocity(ball, {x: x + 5, y})
    }else if(event.keyCode === 83){
        Body.setVelocity(ball, {x, y: y + 5})
    }else if(event.keyCode === 65){
        Body.setVelocity(ball, {x: x - 5, y})
    }
})

// win condition

Events.on(engine, 'collisionStart', event => {
    event.pairs.forEach((collision) => {
        const labels = ['ball', 'goal']

        if(labels.includes(collision.bodyA.label) && labels.includes(collision.bodyB.label)){
            document.querySelector('.winner').classList.remove('hidden')
            world.gravity.y = 1
            world.bodies.forEach(body => {
                if(body.label === 'wall'){
                    Body.setStatic(body, false)
                }
            })
        }
    })
})

