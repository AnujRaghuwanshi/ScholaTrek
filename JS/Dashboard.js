const link = document.getElementById('appraisal-link');

link.addEventListener('click', function (e) {
  if (!link.classList.contains('unlocked')) {
    e.preventDefault();
    alert("Access denied. Admin permission required.");
  }
});


// setTimeout(() => {
//     link.classList.add('unlocked');
// }, 5000);