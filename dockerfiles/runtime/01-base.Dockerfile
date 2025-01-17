ARG FROM_IMAGE
ARG FROM_IMAGE_DEFAULT
ARG DEVEL_IMAGE

FROM ${DEVEL_IMAGE} as devel

FROM ${FROM_IMAGE:-$FROM_IMAGE_DEFAULT}

SHELL ["/bin/bash", "-c"]

ENV CUDA_HOME="/usr/local/cuda"
ENV LD_LIBRARY_PATH="\
${LD_LIBRARY_PATH:+$LD_LIBRARY_PATH:}\
${CUDA_HOME}/lib:\
${CUDA_HOME}/lib64:\
/usr/local/lib:\
/usr/lib"

# Install node
COPY --from=devel /usr/local/bin/node                 /usr/local/bin/node
COPY --from=devel /usr/local/include/node             /usr/local/include/node
COPY --from=devel /usr/local/lib/node_modules         /usr/local/lib/node_modules
# Install yarn
COPY --from=devel /usr/local/bin/yarn                 /usr/local/bin/yarn
COPY --from=devel /usr/local/bin/yarn.js              /usr/local/bin/yarn.js
COPY --from=devel /usr/local/bin/yarn.cmd             /usr/local/bin/yarn.cmd
COPY --from=devel /usr/local/bin/yarnpkg              /usr/local/bin/yarnpkg
COPY --from=devel /usr/local/bin/yarnpkg.cmd          /usr/local/bin/yarnpkg.cmd
COPY --from=devel /usr/local/lib/cli.js               /usr/local/lib/cli.js
COPY --from=devel /usr/local/lib/v8-compile-cache.js  /usr/local/lib/v8-compile-cache.js
# Copy entrypoint
COPY --from=devel /usr/local/bin/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

ARG UID=1000
ARG ADDITIONAL_GROUPS=

RUN useradd --uid $UID --user-group ${ADDITIONAL_GROUPS} --shell /bin/bash --create-home node \
 && ln -s /usr/local/bin/node /usr/local/bin/nodejs \
 && ln -s /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
 && ln -s /usr/local/lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx \
 # smoke tests
 && node --version && npm --version && yarn --version

WORKDIR /home/node

ENTRYPOINT ["docker-entrypoint.sh"]

SHELL ["/bin/bash", "-l"]

CMD ["node"]
