<template>

  <span v-if="icon">
    <VChip
      v-if="showColor"
      label
      :color="kind"
      :textColor="fontColor"
      class="ma-0 pa-0"
      :class="{iconOnly: !includeText, fillWidth}"
      :style="{width: fillWidth? '100%' : 'unset'}"
    >
      <Icon small :color="fontColor" v-bind="$attrs">
        {{ icon }}
      </Icon>
      <span v-if="includeText" class="ml-2">{{ text }}</span>
    </VChip>
    <span v-else>
      <Icon :color="fontColor" v-bind="$attrs">
        {{ icon }}
      </Icon>
      <span v-if="includeText">{{ text }}</span>
    </span>
  </span>

</template>

<script>

  import Constants from 'edit_channel/constants';

  const kinds = Constants.ContentKinds.map(kind => kind.kind);

  export default {
    name: 'ContentNodeIcon',
    props: {
      kind: {
        type: String,
        validator: value => {
          return value === 'unsupported' || kinds.includes(value);
        },
        default: 'unsupported',
      },
      includeText: {
        type: Boolean,
        default: false,
      },
      showColor: {
        type: Boolean,
        default: true,
      },
      isEmpty: {
        type: Boolean,
        default: false,
      },
      fillWidth: {
        type: Boolean,
        default: false,
      },
    },
    computed: {
      fontColor() {
        return this.showColor ? 'white' : 'grey darken-1';
      },
      icon() {
        switch (this.kind) {
          case 'topic':
            if (this.isEmpty) {
              return 'folder_open';
            }
            return 'folder';
          case 'video':
            return 'ondemand_video';
          case 'audio':
            return 'music_note';
          case 'slideshow':
            return 'image';
          case 'exercise':
            return 'assignment';
          case 'document':
            return 'class';
          case 'html5':
            return 'widgets';
          default:
            return 'error_outline';
        }
      },
      text() {
        switch (this.kind) {
          case 'topic':
            return this.$tr('topic');
          case 'video':
            return this.$tr('video');
          case 'audio':
            return this.$tr('audio');
          case 'slideshow':
            return this.$tr('slideshow');
          case 'exercise':
            return this.$tr('exercise');
          case 'document':
            return this.$tr('document');
          case 'html5':
            return this.$tr('html5');
          default:
            return this.$tr('unsupported');
        }
      },
    },
    $trs: {
      topic: 'Topic',
      video: 'Video',
      audio: 'Audio',
      exercise: 'Exercise',
      document: 'Document',
      slideshow: 'Slideshow',
      html5: 'HTML5 App',
      unsupported: 'Unsupported',
    },
  };

</script>

<style lang="less" scoped>

  .iconOnly {
    /deep/ .v-chip__content {
      padding: 0 5px;
    }
  }

</style>