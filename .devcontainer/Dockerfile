# syntax=docker/dockerfile:1.6
# check=error=true

# We dont need [devcontainer base image](https://github.com/devcontainers/images) because
# That is do nothing in Dockerfile!
ARG IMAGE_BASE=debian:stable-slim

# Use `mirror.gcr.io` to avoid pull rate limit of Docker Hub
FROM --platform=${BUILDPLATFORM} mirror.gcr.io/${IMAGE_BASE} AS base

ARG USERNAME=devuser \
    USER_UID=1000 \
    USER_GID=1000 \
    TZ=UTC \
    LANGUAGE=en \
    COUNTRY=US \
    ENCODING=UTF-8 \
    LOCALE="en_US.UTF-8 UTF-8" \
    EDITOR=vim \
    GIT_DELTA_VERSION=0.18.2

ENV DEBIAN_FRONTEND=noninteractive \
    TZ=${TZ} \
    DEVCONTAINER=true \
    EDITOR=${EDITOR} \
    VISUAL=${EDITOR}

# Install utility packages
RUN \
    --mount=type=cache,sharing=locked,target=/var/lib/apt \
    --mount=type=cache,target=/var/cache/apt \
    <<EOL
# keep apt cache, it is dev env!
rm -f /etc/apt/apt.conf.d/docker-clean
echo 'Binary::apt::APT::Keep-Downloaded-Packages "true";' > /etc/apt/apt.conf.d/keep-cache
apt-get update
apt-get full-upgrade -y --no-install-recommends
apt-get install -y --no-install-recommends \
    aggregate \
    apt-utils \
    byobu \
    ca-certificates \
    curl \
    dnsutils \
    fonts-font-awesome \
    fonts-noto-cjk \
    fonts-powerline \
    fzf \
    gnupg \
    gosu \
    htop \
    iproute2 \
    ipset \
    iptables \
    jq \
    less \
    locales \
    lsb-release \
    lsof \
    make \
    man-db \
    net-tools \
    procps \
    python3 \
    python3-pip \
    ripgrep \
    rsync \
    socat \
    sudo \
    tmux \
    unzip \
    vim \
    wget \
    zsh

# Install git-delta
ARCH=$(dpkg --print-architecture)
wget "https://github.com/dandavison/delta/releases/download/${GIT_DELTA_VERSION}/git-delta_${GIT_DELTA_VERSION}_${ARCH}.deb"
dpkg -i "git-delta_${GIT_DELTA_VERSION}_${ARCH}.deb"
rm "git-delta_${GIT_DELTA_VERSION}_${ARCH}.deb"
unset ARCH

# Generate locale
sed -i -e "s|^# *\(${LOCALE}\)|\1|" /etc/locale.gen
sed -i -e "s|^# *\(en_US.UTF-8 UTF-8\)|\1|" /etc/locale.gen
locale-gen
localedef -i "${LANGUAGE}_${COUNTRY}" -f ${ENCODING} "${LANGUAGE}_${COUNTRY}.${ENCODING}"
locale -a
EOL

ENV LC_ALL="${LANGUAGE}_${COUNTRY}.${ENCODING}" \
    LANG="${LANGUAGE}_${COUNTRY}.${ENCODING}" \
    LANGUAGE="${LANGUAGE}_${COUNTRY}.${ENCODING}"

RUN <<EOL
# Update runtime user and group
groupadd --gid ${USER_GID} ${USERNAME}
useradd --gid ${USER_GID} --uid ${USER_UID} -m -s /bin/bash ${USERNAME}
echo "${USERNAME} ALL=(root) NOPASSWD:ALL" > "/etc/sudoers.d/${USERNAME}"
chmod 0440 "/etc/sudoers.d/${USERNAME}"

mkdir -p /workspace
chown -R ${USER_UID}:${USER_GID} /workspace "/home/${USERNAME}"
EOL

RUN <<EOL
# https://code.visualstudio.com/remote/advancedcontainers/persist-bash-history
SNIPPET="export PROMPT_COMMAND='history -a' && export HISTFILE=/commandhistory/.bash_history"
mkdir /commandhistory
touch /commandhistory/.bash_history
chown -R ${USER_UID}:${USER_GID} /commandhistory
echo "${SNIPPET}" >> "/home/${USERNAME}/.bashrc"
echo "${SNIPPET}" >> "/home/${USERNAME}/.zshrc"
unset SNIPPET
EOL

WORKDIR /workspace
USER ${USERNAME}
ENTRYPOINT [ "/bin/bash", "-c" ]
CMD [ "sleep", "infinity" ]
