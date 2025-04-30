async function generatePassword() {
  try {
    const response = await fetch('/api/users/generatePassword', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token'),
      },
    });
    const data = await response.json();
    document.getElementById('password').value = data.password;
  } catch (error) {
    console.error('Error generating password:', error);
  }
}
