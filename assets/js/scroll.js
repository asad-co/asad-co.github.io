
    document.addEventListener('click', function (event) {
        if (event.target.tagName === 'A' && event.target.getAttribute('href').startsWith('#')) {
            event.preventDefault();
            var targetId = event.target.getAttribute('href').substring(1);
            var targetElement = document.getElementById(targetId);

            if (targetElement) {
                var offset = targetElement.offsetTop + (window.innerHeight - targetElement.offsetHeight)/2;
                window.scrollTo({ top: offset, behavior: 'smooth' });
                console.log(targetElement)
            }
        }

    });