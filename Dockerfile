FROM ubuntu:latest

MAINTAINER Richard Berger <richard.berger@outlook.com>

RUN apt update && apt install -y wget build-essential cmake git python

RUN wget -qO /tmp/emsdk-portable.tar.gz https://s3.amazonaws.com/mozilla-games/emscripten/releases/emsdk-portable.tar.gz && \
    tar xvzf /tmp/emsdk-portable.tar.gz -C /usr && rm /tmp/emsdk-portable.tar.gz

RUN cd /usr/emsdk-portable && \
    ./emsdk update && \
    ./emsdk install latest && \
    ./emsdk activate latest

ENV PATH /usr/emsdk_portable:/usr/emsdk_portable/clang/fastcomp/build_master_64/bin:/usr/emsdk_portable/node/4.1.1_64bit/bin:/usr/emsdk_portable/emscripten/master:$PATH

RUN mkdir -p /app

RUN groupadd -g 114 jenkins

RUN useradd -u 106 -g 114 -ms /bin/bash jenkins

USER jenkins

CMD /bin/bash
