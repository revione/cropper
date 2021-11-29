window.onload = function () {
  "use strict"

  var Cropper = window.Cropper

  var URL = window.URL || window.webkitURL

  var container = document.querySelector(".img-container")
  var image = container.getElementsByTagName("img").item(0)

  var download = document.getElementById("download")

  var actions = document.getElementById("actions")

  var options = {
    aspectRatio: 1,
    preview: ".img-preview",
    ready: function (e) {
      console.log(e.type)
    },
    cropstart: function (e) {
      console.log(e.type, e.detail.action)
    },
    cropmove: function (e) {
      console.log(e.type, e.detail.action)
    },
    cropend: function (e) {
      console.log(e.type, e.detail.action)
    },
    crop: function (e) {
      console.log(e.type)
    },
    zoom: function (e) {
      console.log(e.type, e.detail.ratio)
    },
  }

  // console.log(" crop info -  : ", image, options)

  var cropper = new Cropper(image, options)

  var originalImageURL = image.src

  var uploadedImageType = "image/jpeg"

  var uploadedImageURL

  // Tooltip
  $('[data-toggle="tooltip"]').tooltip()

  // Buttons
  if (!document.createElement("canvas").getContext) {
    $('button[data-method="getCroppedCanvas"]').prop("disabled", true)
  }

  if (
    typeof document.createElement("cropper").style.transition === "undefined"
  ) {
    $('button[data-method="rotate"]').prop("disabled", true)
    $('button[data-method="scale"]').prop("disabled", true)
  }

  // Download
  if (download && typeof download.download === "undefined") {
    download.className += " disabled"
  }

  // Methods
  actions.querySelector(".docs-buttons").onclick = function (event) {
    var e = event || window.event
    var target = e.target || e.srcElement
    var cropped
    var result
    var input
    var data

    if (!cropper) {
      return
    }

    while (target !== this) {
      if (target.getAttribute("data-method")) {
        break
      }

      target = target.parentNode
    }

    if (
      target === this ||
      target.disabled ||
      target.className.indexOf("disabled") > -1
    ) {
      return
    }

    data = {
      method: target.getAttribute("data-method"),
      target: target.getAttribute("data-target"),
      option: target.getAttribute("data-option") || undefined,
      secondOption: target.getAttribute("data-second-option") || undefined,
    }

    cropped = cropper.cropped

    console.log("data.method : ", data.method)

    if (data.method) {
      if (typeof data.target !== "undefined") {
        input = document.querySelector(data.target)

        if (!target.hasAttribute("data-option") && data.target && input) {
          try {
            data.option = JSON.parse(input.value)
          } catch (e) {
            console.log(e.message)
          }
        }
      }

      switch (data.method) {
        case "rotate":
          if (cropped) {
            cropper.clear()
          }

          break

        case "getCroppedCanvas":
          try {
            data.option = JSON.parse(data.option)
          } catch (e) {
            console.log(e.message)
          }

          if (uploadedImageType === "image/jpeg") {
            if (!data.option) {
              data.option = {}
            }

            data.option.fillColor = "#fff"
          }

          break
      }

      result = cropper[data.method](data.option, data.secondOption)

      console.log(
        " result cropper ",
        data.method,
        data.option,
        data.secondOption
      )
      console.log(" result ", result)

      switch (data.method) {
        case "rotate":
          if (cropped) {
            cropper.crop()
          }

          break

        case "scaleX":
        case "scaleY":
          target.setAttribute("data-option", -data.option)
          break

        case "getCroppedCanvas":
          if (result) {
            // Bootstrap's Modal
            $("#getCroppedCanvasModal").modal().find(".modal-body").html(result)

            if (!download.disabled) {
              download.href = result.toDataURL(uploadedImageType)
            }
          }

          break

        case "destroy":
          cropper = null

          if (uploadedImageURL) {
            URL.revokeObjectURL(uploadedImageURL)
            uploadedImageURL = ""
            image.src = originalImageURL
          }

          break
      }

      if (typeof result === "object" && result !== cropper && input) {
        try {
          input.value = JSON.stringify(result)
        } catch (e) {
          console.log(e.message)
        }
      }
    }
  }

  document.body.onkeydown = function (event) {
    var e = event || window.event

    if (!cropper || this.scrollTop > 300) {
      return
    }

    switch (e.keyCode) {
      case 37:
        e.preventDefault()
        cropper.move(-1, 0)
        break

      case 38:
        e.preventDefault()
        cropper.move(0, -1)
        break

      case 39:
        e.preventDefault()
        cropper.move(1, 0)
        break

      case 40:
        e.preventDefault()
        cropper.move(0, 1)
        break
    }
  }

  // Import image
  var inputImage = document.getElementById("inputImage")

  if (URL) {
    inputImage.onchange = function () {
      var files = this.files
      var file

      if (cropper && files && files.length) {
        file = files[0]

        if (/^image\/\w+/.test(file.type)) {
          uploadedImageType = file.type

          if (uploadedImageURL) {
            URL.revokeObjectURL(uploadedImageURL)
          }

          image.src = uploadedImageURL = URL.createObjectURL(file)
          cropper.destroy()
          cropper = new Cropper(image, options)
          inputImage.value = null
        } else {
          window.alert("Please choose an image file.")
        }
      }
    }
  } else {
    inputImage.disabled = true
    inputImage.parentNode.className += " disabled"
  }
}
