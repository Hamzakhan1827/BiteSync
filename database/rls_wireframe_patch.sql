-- 3. Allow anonymous reads for Dashboard (The only missing part!)
CREATE POLICY "Allow public select during wireframe phase" 
ON reviews 
FOR SELECT 
USING (true);