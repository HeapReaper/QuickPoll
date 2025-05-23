import router from '@adonisjs/core/services/router'
const PollsController = () => import('#controllers/polls_controller')
import transmit from '@adonisjs/transmit/services/main'

router.get('/test-broadcast', async () => {
  transmit.broadcast('poll-updated', { poll: 1 })
  return { success: true }
})

router.get('/', [PollsController, 'index'])

router.post('/polls-store', [PollsController, 'store'])
router.get('/poll/:id', [PollsController, 'show'])
router.post('/polls/:pollId/vote/:optionId', [PollsController, 'vote'])
router.post('/polls/delete/:id', [PollsController, 'delete'])
transmit.registerRoutes()
