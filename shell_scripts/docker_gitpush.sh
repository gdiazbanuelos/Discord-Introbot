docker exec {docker_container} cat db/users.json > db/users.json
git add .
git commit -m"updated db"
git push