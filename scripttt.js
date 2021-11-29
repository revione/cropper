window.onload = function () {
  "use strict"

  var Cropper = window.Cropper

  var URL = window.URL || window.webkitURL

  var container = document.querySelector(".img-container")
  var image = container.getElementsByTagName("img").item(0)

  var actions = document.getElementById("actions")

  var options = {
    aspectRatio: 1,
    preview: ".img-preview",
  }

  var cropper = new Cropper(image, options)

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

  // Import image
  var inputImage = document.getElementById("inputImage")

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
}
