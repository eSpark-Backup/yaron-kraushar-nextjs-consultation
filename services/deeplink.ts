const DeepLink = {
  success: () => {
    window.location.href = 'https://jimple-f2911.web.app/home?result=success';
  },
  
  error: () => {
    window.location.href = 'https://jimple-f2911.web.app/home?result=error';
  }
};

export default DeepLink;