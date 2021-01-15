const Thanos = function ({
	victim,
	move_to = { x: 100, y: -100 },
	container = document.body,
	pixel_size = 4
}) {
	let imageDataArray = [];
	const canvasCount = 35;

	const weightedRandomDistrib = peak => {
		let prob = [];
		let seq = [];
		for (let i = 0; i < canvasCount; i++) {
			prob.push(Math.pow(canvasCount - Math.abs(peak - i), 3));
			seq.push(i);
		}

		// scan weights array and sum valid entries
        let sum = 0;
        let val;
        for (let weightIndex = 0; weightIndex < prob.length; ++weightIndex) {
            val = prob[weightIndex];
            if (val > 0) sum += val;
        }

        // select a value within range
        let selected = Math.random() * sum;

        // find array entry corresponding to selected value
        let total = 0;
        let lastGoodIdx = -1;
        let chosenIdx;
        for (weightIndex = 0; weightIndex < prob.length; ++weightIndex) {
            val = prob[weightIndex];
            total += val;
            if (val > 0) {
                if (selected <= total) {
                    chosenIdx = weightIndex;
                    break;
                }
                lastGoodIdx = weightIndex;
            }

            // handle any possible rounding error comparison to ensure something is picked
            if (weightIndex === (prob.length - 1)) chosenIdx = lastGoodIdx;
        }

        let chosen = seq[chosenIdx];
        trim = (typeof trim === 'undefined') ? false : trim;
        if (trim) {
            seq.splice(chosenIdx, 1);
            prob.splice(chosenIdx, 1);
        }

		return chosen;
	};

	this.snap = async () => {
		let canvas = await html2canvas(victim);

		//capture all div data as image
		ctx = canvas.getContext("2d");
		let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		let pixelArr = imageData.data;

		for (let i = 0; i < canvasCount; i++) {
			let arr = new Uint8ClampedArray(imageData.data);
			for (let j = 0; j < arr.length; j++) {
				arr[j] = 0;
			}
			imageDataArray.push(arr);
		}

		//put pixel info to imageDataArray (Weighted Distributed)
		for (let i = 0; i < pixelArr.length; i += pixel_size) {
			//find the highest probability canvas the pixel should be in
			let p = Math.floor((i / pixelArr.length) * canvasCount);
			let a = imageDataArray[weightedRandomDistrib(p)];
			for (let j = 0; j < pixel_size; j++) a[i + j] = pixelArr[i + j];
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
			container.appendChild(new_canvas);
		}

		victim.parentNode.removeChild(victim);

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
					element.style.transform = `rotate(${degree_end * progress}deg) translate(${move_to.x * progress}px, ${move_to.y * progress}px)`;
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
