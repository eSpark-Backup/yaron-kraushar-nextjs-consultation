IP=$(ifconfig $(route -n get default | awk '/interface: / {print $2}') | awk '/inet / {print $2}')
export NEXT_PUBLIC_BASE_URL="http://$IP:3000"
npm run dev -- -H $IP