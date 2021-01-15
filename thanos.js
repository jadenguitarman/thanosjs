const Thanos = function (container, moveTo = { x: 100, y: -100 }) {
	let imageDataArray = [];
	const canvasCount = 35;

	this.snap = async () => {
		let canvas = await html2canvas(container);

		//capture all div data as image
		ctx = canvas.getContext("2d");
		var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		var pixelArr = imageData.data;

		for (let i = 0; i < canvasCount; i++) {
			let arr = new Uint8ClampedArray(imageData.data);
			for (let j = 0; j < arr.length; j++) {
				arr[j] = 0;
			}
			imageDataArray.push(arr);
		}

		//put pixel info to imageDataArray (Weighted Distributed)
		for (let i = 0; i < pixelArr.length; i += 4) {
			//find the highest probability canvas the pixel should be in
			let p = Math.floor((i / pixelArr.length) * canvasCount);

			let seq = [];
			for (let i = 0; i < canvasCount; i++) {
				const prob = Math.pow(canvasCount - Math.abs(p - i), 3);
				for (let j = 0; j < prob; j++) {
					seq.push(i);
				}
			}
			let a = imageDataArray[seq[Math.floor(seq.length * Math.random())]];

			a[i] = pixelArr[i];
			a[i + 1] = pixelArr[i + 1];
			a[i + 2] = pixelArr[i + 2];
			a[i + 3] = pixelArr[i + 3];
		}

		//create canvas for each imageData and append to target element
		for (let i = 0; i < canvasCount; i++) {
			let new_canvas = document.createElement('canvas');
			new_canvas.width = canvas.width;
			new_canvas.height = canvas.height;
			tempCtx = new_canvas.getContext("2d");
			tempCtx.putImageData(new ImageData(imageDataArray[i], canvas.width, canvas.height), 0, 0);
			new_canvas.classList.add("dust");
			new_canvas.style.position = "absolute";
			document.body.appendChild(new_canvas);
		}

		container.parentNode.removeChild(container);

		//apply animation
		[...document.getElementsByClassName("dust")].forEach((element, index) => {
			let start = performance.now();
			const animate = time => {
				let timeFraction = (time - start) / 800;
				if (timeFraction > 1) timeFraction = 1;
				element.style.filter = `blur(${0.8 * (1 - Math.sin(Math.acos(timeFraction)))}px)`;
				if (timeFraction < 1) requestAnimationFrame(animate);
			};
			requestAnimationFrame(animate);

			setTimeout(() => {
				const timer = (110 * index) + 800;
				const spin = 20;
				const degree_end = Math.round((Math.random() * spin * 2) - spin);

				let start = performance.now();
				const animate = time => {
					let timeFraction = (time - start) / timer;
					if (timeFraction > 1) timeFraction = 1;
					let progress = (1 - Math.sin(Math.acos(timeFraction)));
					element.style.opacity = (1 - progress).toString();
					element.style.transform = `rotate(${degree_end * progress}deg) translate(${moveTo.x * progress}px, ${moveTo.y * progress}px)`;
					if (timeFraction < 1) requestAnimationFrame(animate);
				};
				requestAnimationFrame(animate);

				setTimeout(() => {
					element.parentNode.removeChild(element);
				}, timer);
			}, 20 * index);
		});
	};
};
