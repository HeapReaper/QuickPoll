import router from '@adonisjs/core/services/router'
const PollsController = () => import('#controllers/polls_controller')

router.get('/', [PollsController, 'index'])
