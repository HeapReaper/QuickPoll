let page = 1
let loading = false

const container = document.getElementById('polls-container')
const loader = document.getElementById('polls-loader')

async function loadPolls() {
  if (loading) return
  loading = true

  loader.style.display = 'block'

  try {
    const res = await fetch(`api/polls/list?page=${page}`)
    const polls = await res.json()

    if (polls.length === 0) {
      // No more data
      window.removeEventListener('scroll', handleScroll);
      loader.textContent = 'No more polls.';
      return;
    }

    for (const poll of polls) {
      console.log(poll)
    }
    polls.forEach(poll => {
      const div = document.createElement('div');
      div.classList.add('poll');
      div.innerHTML = `<h3>${poll.question}</h3>`;
      container.appendChild(div);
    });

    page++;
  } catch (error) {
    console.error(error)
  }
}

function handleScrolling() {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 10) {
    console.log('jeeet')
  }
}

window.addEventListener('scroll', handleScrolling)
loadPolls()
