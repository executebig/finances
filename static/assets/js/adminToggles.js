document.querySelectorAll('.button.endpoint').forEach((el) => {
    const og = el.textContent
    el.addEventListener('click', function () {
        el.classList.add('is-loading')
        fetch(el.dataset.target, {
            method: el.dataset.method || 'GET'
        })
            .then((response) => {
                if (response.status === 200) {
                    el.classList.remove('is-loading')
                    el.classList.add('is-success')
                    el.textContent = 'SUCCESS!'
                    setTimeout(() => {
                        el.classList.remove('is-success')
                        el.textContent = og
                    }, 2000)
                } else {
                    console.log('test')
                    el.classList.remove('is-loading')
                    el.classList.add('is-danger')
                    el.textContent = 'ERROR: ENDPOINT UNREACHABLE'
                    setTimeout(() => {
                        el.classList.remove('is-danger')
                        el.textContent = og
                    }, 2000)
                }
            })
            .catch((e) => {
                el.classList.remove('is-loading')
                el.classList.add('is-danger')
                el.textContent = 'ERROR: ENDPOINT UNREACHABLE'
                setTimeout(() => {
                    el.classList.remove('is-danger')
                    el.textContent = og
                }, 2000)
            })
    })
})