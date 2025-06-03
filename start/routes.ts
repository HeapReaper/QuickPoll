import router from '@adonisjs/core/services/router'
const PollsController = () => import('#controllers/polls_controller')
import transmit from '@adonisjs/transmit/services/main'
import { throttlePollCreation } from '#start/limiter'

router.get('/', [PollsController, 'index'])

router.post('/polls-store', [PollsController, 'store']).use(throttlePollCreation)
router.get('/poll/:id', [PollsController, 'show'])
router.post('/polls/:pollId/vote/:optionId', [PollsController, 'vote']) //.use(throttle)
router.post('/polls/delete/:id', [PollsController, 'delete']).use(throttlePollCreation)

transmit.registerRoutes()
