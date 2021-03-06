<template>
  <div class="music-list">
    <!-- 这个是放回的按钮 -->
    <div class="back" @click="back">
      <i class="icon-back"></i>
    </div>
    <!-- title表示的就是文案的歌手 -->
    <h1 class="title" v-html="title"></h1>

    <!-- 这个就是整个歌手详情上半部分 -->
    <div class="bg-image" :style="bgStyle" ref="bgImage">
      <div class="play-wrapper">
        <!-- 这个是点击播放按钮-->
        <div ref="playBtn" v-show=" songs.length>0 " class="play" @click="random">
          <i class="icon-play"></i>
          <span class="text">随机播放全部</span>
        </div>
      </div>
      <!-- 这个是遮罩层 -->
      <div class="filter" ref="filter"></div>
    </div>

    <!-- 实现的效果就是下面的song-list实现一起滚动的效果 -->
    <div class="bg-layer" ref="layer"></div>
    
    <!-- scroll基础组件 -->
    <scroll :data="songs" @scroll="scroll"
            :listen-scroll="listenScroll" :probe-type="probeType" class="list" ref="list">
      <div class="song-list-wrapper">
        <song-list :songs="songs" :rank="rank" @select="selectItem"></song-list>
      </div>
      <div v-show="!songs.length" class="loading-container">
        <loading></loading>
      </div>
    </scroll>
  </div>
</template>

<script type="text/ecmascript-6">
  import Scroll from 'base/scroll/scroll'
  import Loading from 'base/loading/loading'
  import SongList from 'base/song-list/song-list'
  import {prefixStyle} from 'common/js/dom'
  import {playlistMixin} from 'common/js/mixin'
  import {mapActions} from 'vuex'

  const RESERVED_HEIGHT = 40
  //完场的是属性的前缀
  const transform = prefixStyle('transform')
  const backdrop = prefixStyle('backdrop-filter')

  export default {
    mixins: [playlistMixin],
    props: {
      bgImage: {
        type: String,
        default: ''
      },
      songs: {
        type: Array,
        default: []
      },
      title: {
        type: String,
        default: ''
      },
      rank: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        scrollY: 0
      }
    },
    computed: {
      bgStyle() {
        return `background-image:url(${this.bgImage})`
      }
    },
    created() {
      this.probeType = 3
      this.listenScroll = true
    },
    mounted() {
      // 图片的高度
      this.imageHeight = this.$refs.bgImage.clientHeight

      //求的是layer偏移的最大距离
      this.minTransalteY = -this.imageHeight + RESERVED_HEIGHT
      // 获取照片的高度
      this.$refs.list.$el.style.top = `${this.imageHeight}px`
    },
    methods: {

      // 这个方法就是完成的解决播放器底部的适配
      handlePlaylist(playlist) {
        const bottom = playlist.length > 0 ? '60px' : ''
        this.$refs.list.$el.style.bottom = bottom
        this.$refs.list.refresh()
      },
      // 监听滚动事件,Y轴上的偏移
      scroll(pos) {
        this.scrollY = pos.y
      },
      // 路由的回退
      back() {
        this.$router.back()
      },

      selectItem(item, index) {
        this.selectPlay({
          list: this.songs,
          index
        })
      },

      random() {
        console.log(this.songs)
        this.randomPlay({
          list: this.songs
        })
      },
      // 使用vuex中映射问题
      ...mapActions([
        'selectPlay',
        'randomPlay'
      ])
    },
    watch: {
      // 监听Y轴上的偏移
      // 完成了跟随滚动的效果,也就是向上滑动,效果很好,会遮盖这个图片,文字也会隐藏
      // 文字隐藏的原因就是利用图片的z-index层级高于文字
      // 当向上滚动的效果不是很多的时候,我们就是修改图片的样式,核心点就是修改图片的样式
      
      scrollY(newVal) {
        let translateY = Math.max(this.minTransalteY, newVal)
        let scale = 1
        let zIndex = 0
        let blur = 0
        const percent = Math.abs(newVal / this.imageHeight)
        if (newVal > 0) {
          scale = 1 + percent
          zIndex = 10
        } else {
          blur = Math.min(20, percent * 20)
        }

        this.$refs.layer.style[transform] = `translate3d(0,${translateY}px,0)`
        this.$refs.layer.style[transform] = `translate3d(0,${translateY}px,0)`
        this.$refs.filter.style[backdrop] = `blur(${blur}px)`

        // 这样子的话,就避免了文字滚动出去后还会看见的效果
        if (newVal < this.minTransalteY) {
          zIndex = 10
          this.$refs.bgImage.style.paddingTop = 0
          this.$refs.bgImage.style.height = `${RESERVED_HEIGHT}px`
          this.$refs.playBtn.style.display = 'none'
        } else {
          // 这样子的话,也就是下面的song-list没有遮住图片的话,需要给它设置宽高比

          this.$refs.bgImage.style.paddingTop = '70%'
          this.$refs.bgImage.style.height = 0
          this.$refs.playBtn.style.display = ''
        }
        this.$refs.bgImage.style[transform] = `scale(${scale})`
        this.$refs.bgImage.style.zIndex = zIndex
      }
    },
    components: {
      Scroll,
      Loading,
      SongList
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .music-list
    position: fixed
    z-index: 100
    top: 0
    left: 0
    bottom: 0
    right: 0
    background: $color-background
    .back
      position absolute
      top: 0
      left: 6px
      z-index: 50
      .icon-back
        display: block
        padding: 10px
        font-size: $font-size-large-x
        color: $color-theme
    .title
      position: absolute
      top: 0
      left: 10%
      z-index: 40
      width: 80%
      no-wrap()
      text-align: center
      line-height: 40px
      font-size: $font-size-large
      color: $color-text
    .bg-image
      position: relative
      width: 100%
      height: 0
      padding-top: 70%
      transform-origin: top
      background-size: cover
      .play-wrapper
        position: absolute
        bottom: 20px
        z-index: 50
        width: 100%
        .play
          box-sizing: border-box
          width: 135px
          padding: 7px 0
          margin: 0 auto
          text-align: center
          border: 1px solid $color-theme
          color: $color-theme
          border-radius: 100px
          font-size: 0
          .icon-play
            display: inline-block
            vertical-align: middle
            margin-right: 6px
            font-size: $font-size-medium-x
          .text
            display: inline-block
            vertical-align: middle
            font-size: $font-size-small
      .filter
        position: absolute
        top: 0
        left: 0
        width: 100%
        height: 100%
        background: rgba(7, 17, 27, 0.4)
    .bg-layer
      position: relative
      height: 100%
      background: $color-background
    .list
      position: fixed
      top: 0
      bottom: 0
      width: 100%
      background: $color-background
      .song-list-wrapper
        padding: 20px 30px
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>