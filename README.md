## Docker

```
docker run -p 6379:6379 --name some-redis -d redis
```

## Clean Docker

```
docker exec -it some-redis redis-cli FLUSHALL
```
